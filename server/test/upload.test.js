import assert from "node:assert/strict";
import { unlink } from "node:fs/promises";
import path from "node:path";
import jwt from "jsonwebtoken";
import { after, before, test } from "node:test";
import { createApp } from "../app.js";

process.env.JWT_SECRET ||= "upload-test-secret";

const server = createApp().listen(0);
let baseUrl;

before(() => {
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("homepage image uploads reject files larger than 5 MB", async () => {
  const token = jwt.sign({ id: "admin-id", role: "admin" }, process.env.JWT_SECRET);
  const form = new FormData();
  form.append(
    "image",
    new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: "image/png" }),
    "homepage.png"
  );

  const response = await fetch(`${baseUrl}/api/upload/homepage`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });

  assert.equal(response.status, 413);
  assert.equal((await response.json()).message, "Homepage images must be 5 MB or smaller");
});

test("homepage image uploads are visible at the returned image URL up to 5 MB", async () => {
  const token = jwt.sign({ id: "admin-id", role: "admin" }, process.env.JWT_SECRET);
  const form = new FormData();
  form.append("image", new Blob([Buffer.alloc(5 * 1024 * 1024)], { type: "image/png" }), "homepage.png");

  const response = await fetch(`${baseUrl}/api/upload/homepage`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  const result = await response.json();

  try {
    assert.equal(response.status, 200);
    assert.ok(result.filename);
    assert.match(result.url, /\/uploads\//);
    const imageResponse = await fetch(result.url);
    assert.equal(imageResponse.status, 200);
    assert.equal(Number(imageResponse.headers.get("content-length")), 5 * 1024 * 1024);
    assert.equal(imageResponse.headers.get("cross-origin-resource-policy"), "cross-origin");
  } finally {
    if (result.filename) {
      await unlink(path.join(process.cwd(), "uploads", result.filename));
    }
  }
});
