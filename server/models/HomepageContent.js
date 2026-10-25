import mongoose from "mongoose";

const homepageContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "storefront" },
  draft: { type: mongoose.Schema.Types.Mixed, required: true },
  published: { type: mongoose.Schema.Types.Mixed, default: null },
  publishedAt: { type: Date, default: null },
  updatedBy: { type: String, required: true },
}, {
  timestamps: true,
  minimize: false,
});

export const HomepageContent = mongoose.model("HomepageContent", homepageContentSchema);
