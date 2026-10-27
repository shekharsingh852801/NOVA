import mongoose from "mongoose";

const collectionPageContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: "storefront-collections" },
  draft: { type: mongoose.Schema.Types.Mixed, required: true },
  published: { type: mongoose.Schema.Types.Mixed, default: null },
  publishedAt: { type: Date, default: null },
  updatedBy: { type: String, required: true },
}, {
  timestamps: true,
  minimize: false,
});

export const CollectionPageContent = mongoose.model("CollectionPageContent", collectionPageContentSchema);
