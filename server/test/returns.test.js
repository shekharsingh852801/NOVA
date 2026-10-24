import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { after, before, test } from "node:test";
import { createApp } from "../app.js";

const server = createApp().listen(0);
const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";
let baseUrl;

before(() => {
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("return endpoints require customer or admin authentication", async () => {
  const customerResponse = await fetch(`${baseUrl}/api/returns/mine`);
  assert.equal(customerResponse.status, 401);

  const adminResponse = await fetch(`${baseUrl}/api/returns/admin`);
  assert.equal(adminResponse.status, 401);
});

test("return requests reject invalid order identifiers before database access", async () => {
  const token = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "customer" }, jwtSecret);
  const response = await fetch(`${baseUrl}/api/returns`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId: "not-an-id", reason: "damaged" }),
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "A valid order is required");
});

test("admin return listing validates pagination and status", async () => {
  const token = jwt.sign({ id: "admin-id", role: "admin" }, jwtSecret);
  const invalidStatus = await fetch(`${baseUrl}/api/returns/admin?status=unknown`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(invalidStatus.status, 400);
  assert.equal((await invalidStatus.json()).message, "Invalid return request status");

  const invalidPagination = await fetch(`${baseUrl}/api/returns/admin?page=0`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(invalidPagination.status, 400);
  assert.equal((await invalidPagination.json()).message, "Invalid return request pagination");
});

test("return requests require a valid reason and refund reference", async () => {
  const customerToken = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "customer" }, jwtSecret);
  const invalidReason = await fetch(`${baseUrl}/api/returns`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ orderId: "507f1f77bcf86cd799439012", reason: "not-a-reason" }),
  });
  assert.equal(invalidReason.status, 400);
  assert.equal((await invalidReason.json()).message, "Choose a valid return reason");

  const adminToken = jwt.sign({ id: "admin-id", role: "admin" }, jwtSecret);
  const missingRefundReference = await fetch(`${baseUrl}/api/returns/admin/507f1f77bcf86cd799439012`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: "refunded" }),
  });
  assert.equal(missingRefundReference.status, 400);
  assert.equal((await missingRefundReference.json()).message, "Enter the external refund reference before recording a refund");
});
