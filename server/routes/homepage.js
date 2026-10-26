import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authenticateAdmin } from "../middleware/auth.js";
import { HomepageContent } from "../models/HomepageContent.js";
import { defaultHomepageContent } from "../data/homepage.js";

const router = Router();
const singletonKey = "storefront";
const text = (max = 300) => z.string().trim().max(max);
const imageUrl = z.string().trim().min(1).max(2000).refine(
  (value) => value.startsWith("/") && !value.startsWith("//") || /^https?:\/\/\S+$/i.test(value),
  "Image must be a local path or an HTTP(S) URL"
);
const link = text(500).refine(
  (value) => value === "" || value.startsWith("#") && !/^#\s*javascript:/i.test(value) || value.startsWith("/") && !value.startsWith("//") || /^[a-z0-9][a-z0-9/_?=&%.-]*$/i.test(value) || /^https?:\/\/\S+$/i.test(value),
  "Link must be an internal path or an HTTP(S) URL"
);
const externalUrl = text(500).refine(
  (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
  "Social profile must be an HTTP(S) URL"
);
const email = text(254).refine(
  (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  "Enter a valid email address"
);
const pair = z.object({ title: text(100), subtitle: text(200) }).strict();
const stat = z.object({ value: text(40), label: text(80) }).strict();
const footerLink = z.object({
  group: z.enum(["Shop", "Support", "About"]),
  label: text(80).min(1),
  href: link.refine((value) => value.length > 0, "Footer link destination is required"),
}).strict();
const legalLink = z.object({
  label: text(80).min(1),
  href: link.refine((value) => value.length > 0, "Legal link destination is required"),
}).strict();
const footerSchema = z.object({
  tagline: text(200),
  instagramHandle: text(80),
  instagramUrl: externalUrl,
  facebookUrl: externalUrl,
  pinterestUrl: externalUrl,
  youtubeUrl: externalUrl,
  tiktokUrl: externalUrl,
  contactEmail: email,
  supportPhone: text(40),
  newsletterHeading: text(100),
  newsletterDescription: text(240),
  copyright: text(160),
  links: z.array(footerLink).max(24),
  legalLinks: z.array(legalLink).max(6),
}).strict();
const testimonial = z.object({
  name: text(100).min(1),
  avatar: imageUrl,
  rating: z.number().int().min(1).max(5),
  verified: z.boolean(),
  quote: text(1000).min(1),
  postedAt: text(80),
}).strict();
const sharedSection = {
  id: z.string(),
  enabled: z.boolean(),
};
const heroSlide = z.object({
  image: imageUrl,
  alt: text(300),
  eyebrow: text(100),
  heading: text(180).min(1),
  description: text(600),
  primaryLabel: text(80).min(1),
  primaryHref: link,
}).strict();
const defaultHeroSlides = defaultHomepageContent.sections.find((section) => section.id === "hero").slides;
const sectionSchemas = [
  z.object({
    ...sharedSection, id: z.literal("hero"), image: imageUrl, alt: text(300), eyebrow: text(100),
    heading: text(180).min(1), description: text(600), primaryLabel: text(80).min(1),
    primaryHref: link, secondaryLabel: text(80), slides: z.array(heroSlide).max(9).default(defaultHeroSlides),
  }).strict(),
  z.object({ ...sharedSection, id: z.literal("featureBar"), items: z.array(pair).min(1).max(8) }).strict(),
  z.object({
    ...sharedSection, id: z.literal("newArrivals"), eyebrow: text(100), heading: text(120).min(1),
    buttonLabel: text(80).min(1), buttonHref: link,
    productSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(10)
      .refine((slugs) => new Set(slugs).size === slugs.length, "Selected products must be unique"),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("categories"), eyebrow: text(100), heading: text(120).min(1),
    description: text(600), buttonLabel: text(80).min(1), buttonHref: link,
    items: z.array(z.object({ name: text(60).min(1), cta: text(60), image: imageUrl }).strict()).min(1).max(8),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("brandStory"), image: imageUrl, alt: text(300), eyebrow: text(100),
    heading: text(120).min(1), description: text(600), buttonLabel: text(80).min(1),
    buttonHref: link, stats: z.array(stat).min(1).max(8),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("sustainability"), image: imageUrl, alt: text(300), eyebrow: text(100),
    heading: text(120).min(1), description: text(600), buttonLabel: text(80).min(1),
    buttonHref: link, points: z.array(pair).min(1).max(8),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("testimonials"), eyebrow: text(100), heading: text(120).min(1),
    items: z.array(testimonial).min(1).max(10),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("lookbook"), eyebrow: text(100), heading: text(120).min(1),
    description: text(600), buttonLabel: text(80).min(1),
    images: z.array(z.object({ src: imageUrl, alt: text(300).min(1) }).strict()).min(1).max(12),
  }).strict(),
  z.object({
    ...sharedSection, id: z.literal("newsletter"), image: imageUrl, alt: text(300), eyebrow: text(100),
    heading: text(120).min(1), description: text(600),
  }).strict(),
];
export const homepageSchema = z.object({
  sections: z.array(z.discriminatedUnion("id", sectionSchemas)).length(sectionSchemas.length),
  footer: footerSchema,
}).strict().superRefine((content, ctx) => {
  const ids = content.sections.map((section) => section.id);
  if (new Set(ids).size !== sectionSchemas.length || sectionSchemas.some((schema) => !ids.includes(schema.shape.id.value))) {
    ctx.addIssue({ code: "custom", message: "Homepage sections must include each supported section exactly once", path: ["sections"] });
  }
});

function errorMessage(error) {
  return error instanceof z.ZodError ? error.issues[0]?.message || "Invalid homepage content" : error.message;
}

export function normalizeHomepageContent(content) {
  const storedFooter = content?.footer && typeof content.footer === "object" && !Array.isArray(content.footer)
    ? content.footer
    : {};
  const footer = { ...defaultHomepageContent.footer };
  for (const key of Object.keys(defaultHomepageContent.footer)) {
    if (key === "links" || key === "legalLinks") continue;
    if (Object.hasOwn(storedFooter, key)) footer[key] = storedFooter[key];
  }
  if (Array.isArray(storedFooter.links)) footer.links = storedFooter.links;
  if (Array.isArray(storedFooter.legalLinks)) footer.legalLinks = storedFooter.legalLinks;

  const result = homepageSchema.safeParse({
    sections: content?.sections,
    footer,
  });
  if (!result.success) {
    throw Object.assign(new Error("Stored homepage sections are invalid"), { status: 500 });
  }
  return result.data;
}

function signPreviewToken(adminId) {
  return jwt.sign(
    { purpose: "homepage_preview", adminId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

router.get("/", async (_req, res, next) => {
  try {
    const record = await HomepageContent.findOne({ key: singletonKey }).select("published publishedAt");
    res.set("Cache-Control", "no-store");
    res.json({
      content: record?.published ? normalizeHomepageContent(record.published) : null,
      publishedAt: record?.publishedAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", authenticateAdmin, async (_req, res, next) => {
  try {
    const record = await HomepageContent.findOne({ key: singletonKey });
    res.set("Cache-Control", "no-store");
    res.json({
      draft: record ? normalizeHomepageContent(record.draft) : defaultHomepageContent,
      hasDraft: Boolean(record),
      publishedAt: record?.publishedAt || null,
      updatedAt: record?.updatedAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/draft", authenticateAdmin, async (req, res, next) => {
  const result = homepageSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: errorMessage(result.error) });

  try {
    const record = await HomepageContent.findOneAndUpdate(
      { key: singletonKey },
      { $set: { draft: result.data, updatedBy: req.admin.id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ draft: normalizeHomepageContent(record.draft), updatedAt: record.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/publish", authenticateAdmin, async (req, res, next) => {
  try {
    const record = await HomepageContent.findOne({ key: singletonKey });
    if (!record) return res.status(409).json({ message: "Save a homepage draft before publishing" });

    record.published = normalizeHomepageContent(record.draft);
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
    const record = await HomepageContent.findOne({ key: singletonKey }).select("_id");
    if (!record) return res.status(409).json({ message: "Save a homepage draft before previewing" });
    res.json({ token: signPreviewToken(req.admin.id) });
  } catch (error) {
    next(error);
  }
});

router.get("/preview/:token", async (req, res, next) => {
  try {
    const payload = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (typeof payload === "string" || payload.purpose !== "homepage_preview") {
      return res.status(401).json({ message: "Preview token is not valid" });
    }
    const record = await HomepageContent.findOne({ key: singletonKey }).select("draft");
    if (!record) return res.status(404).json({ message: "Homepage draft not found" });
    res.set("Cache-Control", "no-store");
    res.json({ content: normalizeHomepageContent(record.draft) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Preview token is not valid or has expired" });
    }
    next(error);
  }
});

export default router;
