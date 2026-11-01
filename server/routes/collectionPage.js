import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authenticateAdmin } from "../middleware/auth.js";
import { CollectionPageContent } from "../models/CollectionPageContent.js";
import { defaultCollectionPageContent } from "../data/collectionPage.js";

const router = Router();
const singletonKey = "storefront-collections";
const text = (max) => z.string().trim().min(1).max(max);
const imageUrl = z.string().trim().min(1).max(2000).refine(
  (value) => value.startsWith("/") && !value.startsWith("//") || /^https?:\/\/\S+$/i.test(value),
  "Image must be a local path or an HTTP(S) URL"
);
const collectionSchema = z.object({
  slug: z.enum(["winter-26", "everyday-uniform", "soft-structure"]),
  title: text(120),
  image: imageUrl,
  story: text(600),
  productSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .refine((slugs) => new Set(slugs).size === slugs.length, "Selected products must be unique")
    .optional(),
}).strict();

export const collectionPageSchema = z.object({
  eyebrow: text(100),
  title: text(120),
  description: text(600),
  collections: z.array(collectionSchema).length(defaultCollectionPageContent.collections.length),
}).strict().superRefine((content, ctx) => {
  const slugs = content.collections.map((collection) => collection.slug);
  if (new Set(slugs).size !== defaultCollectionPageContent.collections.length) {
    ctx.addIssue({ code: "custom", message: "Each collection must appear exactly once", path: ["collections"] });
  }
});

function errorMessage(error) {
  return error instanceof z.ZodError ? error.issues[0]?.message || "Invalid collection page content" : error.message;
}

function normalizeCollectionPageContent(content) {
  const result = collectionPageSchema.safeParse(content);
  if (!result.success) {
    throw Object.assign(new Error("Stored collection page content is invalid"), { status: 500 });
  }
  return result.data;
}

function signPreviewToken(adminId) {
  return jwt.sign(
    { purpose: "collection_page_preview", adminId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

router.get("/", async (_req, res, next) => {
  try {
    const record = await CollectionPageContent.findOne({ key: singletonKey }).select("published publishedAt");
    res.set("Cache-Control", "no-store");
    res.json({
      content: record?.published ? normalizeCollectionPageContent(record.published) : null,
      publishedAt: record?.publishedAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", authenticateAdmin, async (_req, res, next) => {
  try {
    const record = await CollectionPageContent.findOne({ key: singletonKey });
    res.set("Cache-Control", "no-store");
    res.json({
      draft: record ? normalizeCollectionPageContent(record.draft) : defaultCollectionPageContent,
      hasDraft: Boolean(record),
      publishedAt: record?.publishedAt || null,
      updatedAt: record?.updatedAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/draft", authenticateAdmin, async (req, res, next) => {
  const result = collectionPageSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: errorMessage(result.error) });

  try {
    const record = await CollectionPageContent.findOneAndUpdate(
      { key: singletonKey },
      { $set: { draft: result.data, updatedBy: req.admin.id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ draft: normalizeCollectionPageContent(record.draft), updatedAt: record.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/publish", authenticateAdmin, async (req, res, next) => {
  try {
    const record = await CollectionPageContent.findOne({ key: singletonKey });
    if (!record) return res.status(409).json({ message: "Save a collection page draft before publishing" });

    record.published = normalizeCollectionPageContent(record.draft);
    record.publishedAt = new Date();
    record.updatedBy = req.admin.id;
    await record.save();
    res.json({ publishedAt: record.publishedAt });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/preview-token", authenticateAdmin, async (req, res, next) => {
  try {
    const record = await CollectionPageContent.findOne({ key: singletonKey }).select("_id");
    if (!record) return res.status(409).json({ message: "Save a collection page draft before previewing" });
    res.json({ token: signPreviewToken(req.admin.id) });
  } catch (error) {
    next(error);
  }
});

router.get("/preview/:token", async (req, res, next) => {
  try {
    const payload = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (typeof payload === "string" || payload.purpose !== "collection_page_preview") {
      return res.status(401).json({ message: "Preview token is not valid" });
    }
    const record = await CollectionPageContent.findOne({ key: singletonKey }).select("draft");
    if (!record) return res.status(404).json({ message: "Collection page draft not found" });
    res.set("Cache-Control", "no-store");
    res.json({ content: normalizeCollectionPageContent(record.draft) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Preview token is not valid or has expired" });
    }
    next(error);
  }
});

export default router;
