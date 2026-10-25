import { Router } from "express";
import { z } from "zod";
import { Setting } from "../models/Setting.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Keys readable by the storefront (no secrets here)
const PUBLIC_KEYS = ["ga4_id", "meta_pixel_id", "whatsapp_number", "site_url"];

export async function getPublicSettings() {
  const docs = await Setting.find({ key: { $in: PUBLIC_KEYS } }).lean();
  return Object.fromEntries(docs.map((doc) => [doc.key, doc.value]));
}

// Public: storefront config (analytics ids, whatsapp, canonical site url)
router.get("/public", async (_req, res, next) => {
  try {
    res.json(await getPublicSettings());
  } catch (err) {
    next(err);
  }
});

const settingsBodySchema = z.object({
  ga4_id: z.string().trim().max(40).optional(),
  meta_pixel_id: z.string().trim().max(40).optional(),
  whatsapp_number: z.string().trim().max(24).optional(),
  site_url: z.string().trim().max(200).optional(),
});

// Admin: update settings (upsert each provided key)
router.put("/", authenticateAdmin, async (req, res, next) => {
  try {
    const body = settingsBodySchema.parse(req.body);
    const entries = Object.entries(body).filter(([, value]) => value !== undefined);
    for (const [key, value] of entries) {
      await Setting.updateOne({ key }, { $set: { value } }, { upsert: true });
    }
    res.json(await getPublicSettings());
  } catch (err) {
    next(err);
  }
});

export default router;
