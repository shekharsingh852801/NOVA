import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApp } from "../app.js";
import { defaultHomepageContent } from "../data/homepage.js";
import { serializeProduct } from "../routes/products.js";
import { homepageSchema, normalizeHomepageContent } from "../routes/homepage.js";

const server = createApp().listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("homepage defaults satisfy the content contract", () => {
  const result = homepageSchema.safeParse(defaultHomepageContent);
  assert.equal(result.success, true, result.success ? "" : result.error.message);
  assert.equal(defaultHomepageContent.sections.find((section) => section.id === "hero").slides.length, 3);
});

test("homepage content rejects missing or duplicate sections", () => {
  const duplicate = structuredClone(defaultHomepageContent);
  duplicate.sections[1].id = "hero";
  assert.equal(homepageSchema.safeParse(duplicate).success, false);

  const missing = structuredClone(defaultHomepageContent);
  missing.sections.pop();
  assert.equal(homepageSchema.safeParse(missing).success, false);
});

test("homepage content rejects unsafe links and unsupported fields", () => {
  const unsafeLink = structuredClone(defaultHomepageContent);
  unsafeLink.sections.find((section) => section.id === "hero").primaryHref = "javascript:alert(1)";
  assert.equal(homepageSchema.safeParse(unsafeLink).success, false);

  const unsafeSlideLink = structuredClone(defaultHomepageContent);
  unsafeSlideLink.sections.find((section) => section.id === "hero").slides[0].primaryHref = "javascript:alert(1)";
  assert.equal(homepageSchema.safeParse(unsafeSlideLink).success, false);

  const unsupportedField = structuredClone(defaultHomepageContent);
  unsupportedField.sections.find((section) => section.id === "hero").customMarkup = "<script>";
  assert.equal(homepageSchema.safeParse(unsupportedField).success, false);
});

test("homepage content includes homepage sections and editable footer content", () => {
  assert.deepEqual(Object.keys(defaultHomepageContent), ["footer", "sections"]);

  const legacyRecord = structuredClone(defaultHomepageContent);
  legacyRecord.footer = { tagline: "Legacy store footer" };
  legacyRecord.header = { shopLabel: "Old navigation label" };
  legacyRecord.announcement = { enabled: false, messages: [] };
  delete legacyRecord.sections.find((section) => section.id === "hero").slides;
  const normalized = normalizeHomepageContent(legacyRecord);

  assert.deepEqual(Object.keys(normalized), ["sections", "footer"]);
  assert.deepEqual(normalized.sections, defaultHomepageContent.sections);
  assert.equal(normalized.footer.tagline, "Legacy store footer");
  assert.deepEqual(normalized.footer.links, defaultHomepageContent.footer.links);
  assert.equal(homepageSchema.safeParse(legacyRecord).success, false);
});

test("homepage footer rejects invalid contact and social URLs", () => {
  const invalidEmail = structuredClone(defaultHomepageContent);
  invalidEmail.footer.contactEmail = "not-an-email";
  assert.equal(homepageSchema.safeParse(invalidEmail).success, false);

  const unsafeSocialUrl = structuredClone(defaultHomepageContent);
  unsafeSocialUrl.footer.instagramUrl = "javascript:alert(1)";
  assert.equal(homepageSchema.safeParse(unsafeSocialUrl).success, false);
});

test("homepage draft endpoints require admin authentication", async () => {
  const response = await fetch(`${baseUrl}/api/homepage/admin`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, "No token provided, authorization denied");

  const contentSizedRequest = await fetch(`${baseUrl}/api/homepage/admin/draft`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draft: "x".repeat(11 * 1024) }),
  });
  assert.equal(contentSizedRequest.status, 401);
});

test("product serialization supports existing legacy catalog records", () => {
  const product = serializeProduct({
    _id: "legacy-product",
    slug: "legacy-product",
    name: "Legacy Product",
    category: "men",
    image: "/legacy-product.jpg",
    images: ["/legacy-product.jpg", "/legacy-product-detail.jpg"],
    colors: ["Stone", { name: "Moss", value: "#66705b" }],
    sizes: ["S", "M"],
    tags: ["Essential"],
  });

  assert.equal(product.id, "legacy-product");
  assert.equal(product.category, "Men");
  assert.deepEqual(product.images, ["/legacy-product.jpg", "/legacy-product-detail.jpg"]);
  assert.deepEqual(product.colors, [
    { name: "Stone", value: "#d1c8b8" },
    { name: "Moss", value: "#66705b" },
  ]);
  assert.deepEqual(product.sizes, ["S", "M"]);
  assert.deepEqual(product.tags, ["Essential"]);
  assert.equal(product.price, 0);
  assert.equal(product.stock, 0);
});

test("product serialization supports current JSON catalog fields", () => {
  const product = serializeProduct({
    slug: "current-product",
    category: "women",
    colors_json: JSON.stringify(["Ink"]),
    images_json: JSON.stringify(["/current-product.jpg"]),
    sizes_json: JSON.stringify(["M"]),
    tags_json: JSON.stringify(["New"]),
    price: 65,
    stock: 4,
    featured: 1,
  });

  assert.equal(product.category, "Women");
  assert.equal(product.price, 65);
  assert.equal(product.stock, 4);
  assert.equal(product.featured, true);
  assert.deepEqual(product.images, ["/current-product.jpg"]);
  assert.deepEqual(product.colors, [{ name: "Ink", value: "#20201e" }]);
});
