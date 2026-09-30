import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../app.js";
import { closeDB, connectDB, getDB } from "../config/db.js";
import { seedDatabase } from "../seed/seedDatabase.js";
import { products as seedProducts } from "../seed/seedData.js";

const server = createApp().listen(0);
let baseUrl;

function validOrder(items = [{ slug: "essential-oversized-sweatshirt", size: "M", color: "Stone", quantity: 2 }]) {
  return {
    customer: { name: "NOVA Guest", email: "guest@example.com", phone: "5550100" },
    shippingAddress: { address: "1 Main Street", city: "Portland", state: "Oregon", postal: "97201" },
    paymentMethod: "cash_on_delivery",
    items,
  };
}

before(() => {
  connectDB(":memory:");
  seedDatabase();
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  closeDB();
});

test("health endpoint remains available without a database", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", service: "nova-server" });
  assert.ok(response.headers.get("x-request-id"));
  assert.ok(response.headers.get("x-content-type-options"));
});

test("readiness reports the in-memory SQLite database", async () => {
  const response = await fetch(`${baseUrl}/api/health/ready`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ready", database: "connected" });
});

test("newsletter validation rejects missing and malformed email before database access", async () => {
  const missing = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(missing.status, 400);
  assert.equal((await missing.json()).message, "Email is required");

  const malformed = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).message, "Please enter a valid email address");
});

test("invalid product filters are rejected without database access", async () => {
  const response = await fetch(`${baseUrl}/api/products?category=unknown`);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Invalid product category");
});

test("all seeded storefront products are present in SQLite", () => {
  assert.equal(seedProducts.length, 10);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM products").get().count, 10);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM testimonials").get().count, 3);
});

test("catalog and testimonials are served from SQLite", async () => {
  const productsResponse = await fetch(`${baseUrl}/api/products?category=men&newArrivals=true`);
  const products = await productsResponse.json();
  assert.equal(productsResponse.status, 200);
  assert.ok(products.length > 0);
  assert.ok(products.every((product) => product.category === "Men" && product.newArrival));

  const testimonialsResponse = await fetch(`${baseUrl}/api/testimonials`);
  assert.equal(testimonialsResponse.status, 200);
  assert.equal((await testimonialsResponse.json()).length, 3);
});

test("order creation rejects invalid payloads before database access", async () => {
  const missingCustomer = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(missingCustomer.status, 400);
  assert.equal((await missingCustomer.json()).message, "Customer name is required");

  const emptyOrder = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: { name: "NOVA Guest", email: "guest@example.com", phone: "5550100" },
      shippingAddress: { address: "1 Main Street", city: "Portland", state: "Oregon", postal: "97201" },
      paymentMethod: "cash_on_delivery",
      items: [],
    }),
  });
  assert.equal(emptyOrder.status, 400);
  assert.equal((await emptyOrder.json()).message, "Order must contain between 1 and 20 items");
});

test("order tracking rejects malformed lookup details before database access", async () => {
  const response = await fetch(`${baseUrl}/api/orders/track`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderNumber: "not-an-order", email: "not-an-email" }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Enter a valid order number and checkout email");
});

test("orders use SQLite catalog pricing, reserve stock, and can be tracked", async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validOrder()),
  });
  const result = await response.json();
  assert.equal(response.status, 201);
  assert.match(result.order.orderNumber, /^NV-[A-F0-9]{8}$/);
  assert.equal(result.order.total, 158);

  const product = getDB().prepare("SELECT stock FROM products WHERE slug = ?").get("essential-oversized-sweatshirt");
  assert.equal(product.stock, 16);

  const trackResponse = await fetch(`${baseUrl}/api/orders/track`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderNumber: result.order.orderNumber, email: "GUEST@example.com" }),
  });
  assert.equal(trackResponse.status, 200);
  assert.equal((await trackResponse.json()).order.orderNumber, result.order.orderNumber);
});

test("failed multi-item orders roll back stock and order rows", async () => {
  const beforeStock = getDB().prepare("SELECT stock FROM products WHERE slug = ?").get("essential-oversized-sweatshirt").stock;
  const beforeOrders = getDB().prepare("SELECT COUNT(*) AS count FROM orders").get().count;
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validOrder([
      { slug: "essential-oversized-sweatshirt", size: "M", color: "Stone", quantity: 1 },
      { slug: "weekender-tote", size: "One size", color: "Natural", quantity: 1 },
    ])),
  });
  assert.equal(response.status, 409);
  assert.equal(getDB().prepare("SELECT stock FROM products WHERE slug = ?").get("essential-oversized-sweatshirt").stock, beforeStock);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM orders").get().count, beforeOrders);
});

test("support endpoints reject invalid input before database access", async () => {
  const contact = await fetch(`${baseUrl}/api/support/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "bad-email", message: "Hello there, please help." }),
  });
  assert.equal(contact.status, 400);
  assert.equal((await contact.json()).message, "A valid name is required");

  const stockAlert = await fetch(`${baseUrl}/api/support/back-in-stock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "bad-email", productSlug: "weekender-tote" }),
  });
  assert.equal(stockAlert.status, 400);
  assert.equal((await stockAlert.json()).message, "A valid email address is required");
});

test("newsletter subscribers and valid support requests persist in SQLite", async () => {
  const subscribe = (email) => fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, source: "footer" }),
  });
  assert.equal((await subscribe("sqlite@example.com")).status, 201);
  assert.equal((await subscribe("SQLITE@example.com")).status, 200);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM subscribers").get().count, 1);

  const contact = await fetch(`${baseUrl}/api/support/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "NOVA Guest", email: "guest@example.com", topic: "Product question", message: "Could you tell me more about this piece?" }),
  });
  assert.equal(contact.status, 201);

  const alertPayload = { email: "restock@example.com", productSlug: "weekender-tote" };
  const firstAlert = await fetch(`${baseUrl}/api/support/back-in-stock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(alertPayload),
  });
  assert.equal(firstAlert.status, 201);
  const duplicateAlert = await fetch(`${baseUrl}/api/support/back-in-stock`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(alertPayload),
  });
  assert.equal(duplicateAlert.status, 200);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM support_requests WHERE kind = 'back-in-stock'").get().count, 1);
  assert.equal(getDB().prepare("SELECT COUNT(*) AS count FROM support_requests WHERE kind = 'contact'").get().count, 1);
});

test("malformed JSON gets a safe client error", async () => {
  const response = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{invalid",
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Invalid JSON request body");
});

test("oversized JSON gets a payload-too-large response", async () => {
  const response = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "a@example.com", extra: "x".repeat(11 * 1024) }),
  });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).message, "Request body exceeds the 10 KB limit");
});

test("unknown paths return a stable not-found response", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).message, "Route not found");
});