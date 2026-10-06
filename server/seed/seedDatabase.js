import { Product } from "../models/Product.js";
import { Testimonial } from "../models/Testimonial.js";
import { products, testimonials } from "./seedData.js";

export async function seedDatabase({ reset = false } = {}) {
  if (reset) {
    await Product.deleteMany({});
    await Testimonial.deleteMany({});
  }

  for (const product of products) {
    const existing = await Product.findOne({ slug: product.slug });
    if (!existing) {
      await Product.create({
        ...product,
        compare_at_price: product.compareAtPrice,
        images_json: JSON.stringify(product.images),
        colors_json: JSON.stringify(product.colors),
        sizes_json: JSON.stringify(product.sizes),
        tags_json: JSON.stringify(product.tags),
        is_new_arrival: Number(product.isNewArrival),
        new_arrival: Number(product.newArrival),
        featured: Number(product.featured),
        best_seller: Number(product.bestSeller),
        trending: Number(product.trending),
      });
    }
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (reset || testimonialCount === 0) {
    if (!reset) await Testimonial.deleteMany({});
    for (const testimonial of testimonials) {
      await Testimonial.create({
        ...testimonial,
        posted_at: testimonial.postedAt,
        sort_order: testimonial.sortOrder,
        verified: Number(testimonial.verified)
      });
    }
  }

  return {
    products: await Product.countDocuments(),
    testimonials: await Testimonial.countDocuments(),
  };
}