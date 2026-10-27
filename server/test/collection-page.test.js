import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApp } from "../app.js";
import { defaultCollectionPageContent } from "../data/collectionPage.js";
import { collectionPageSchema } from "../routes/collectionPage.js";

const server = createApp().listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test("collection page defaults satisfy the editable content contract", () => {
  const result = collectionPageSchema.safeParse(defaultCollectionPageContent);
  assert.equal(result.success, true, result.success ? "" : result.error.message);
  assert.equal(defaultCollectionPageContent.collections.length, 3);
});

test("collection page content rejects unknown fields, destinations, and incomplete cards", () => {
  const unsupportedField = structuredClone(defaultCollectionPageContent);
  unsupportedField.customMarkup = "<script>";
  assert.equal(collectionPageSchema.safeParse(unsupportedField).success, false);

  const unsupportedSlug = structuredClone(defaultCollectionPageContent);
  unsupportedSlug.collections[0].slug = "new-collection";
  assert.equal(collectionPageSchema.safeParse(unsupportedSlug).success, false);

  const duplicateSlug = structuredClone(defaultCollectionPageContent);
  duplicateSlug.collections[1].slug = duplicateSlug.collections[0].slug;
  assert.equal(collectionPageSchema.safeParse(duplicateSlug).success, false);

  const unsafeImage = structuredClone(defaultCollectionPageContent);
  unsafeImage.collections[0].image = "javascript:alert(1)";
  assert.equal(collectionPageSchema.safeParse(unsafeImage).success, false);

  const selectedProducts = structuredClone(defaultCollectionPageContent);
  selectedProducts.collections[0].productSlugs = ["everyday-tee", "utility-trouser"];
  assert.equal(collectionPageSchema.safeParse(selectedProducts).success, true);

  const duplicateProducts = structuredClone(defaultCollectionPageContent);
  duplicateProducts.collections[0].productSlugs = ["everyday-tee", "everyday-tee"];
  assert.equal(collectionPageSchema.safeParse(duplicateProducts).success, false);

  const invalidProductSlug = structuredClone(defaultCollectionPageContent);
  invalidProductSlug.collections[0].productSlugs = ["not a slug"];
  assert.equal(collectionPageSchema.safeParse(invalidProductSlug).success, false);

  assert.equal(collectionPageSchema.safeParse(defaultCollectionPageContent).success, true);
});

test("collection page draft endpoints require admin authentication", async () => {
  const response = await fetch(`${baseUrl}/api/collections/admin`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, "No token provided, authorization denied");
});
