import { getDB } from "../config/db.js";
import { products, testimonials } from "./seedData.js";

export function seedDatabase({ reset = false } = {}) {
  const db = getDB();
  const seed = db.transaction(() => {
    if (reset) {
      db.exec("DELETE FROM products; DELETE FROM testimonials;");
    }

    const insertProduct = db.prepare(`
      INSERT INTO products (
        slug, name, subcategory, price, compare_at_price, image, images_json, tag,
        colors_json, sizes_json, description, material, fit, care, rating, reviews,
        stock, tags_json, category, is_new_arrival, new_arrival, featured,
        best_seller, trending, sort_order
      ) VALUES (
        @slug, @name, @subcategory, @price, @compareAtPrice, @image, @imagesJson, @tag,
        @colorsJson, @sizesJson, @description, @material, @fit, @care, @rating, @reviews,
        @stock, @tagsJson, @category, @isNewArrival, @newArrival, @featured,
        @bestSeller, @trending, @sortOrder
      ) ON CONFLICT(slug) DO NOTHING
    `);

    for (const product of products) {
      insertProduct.run({
        ...product,
        compareAtPrice: product.compareAtPrice,
        imagesJson: JSON.stringify(product.images),
        colorsJson: JSON.stringify(product.colors),
        sizesJson: JSON.stringify(product.sizes),
        tagsJson: JSON.stringify(product.tags),
        isNewArrival: Number(product.isNewArrival),
        newArrival: Number(product.newArrival),
        featured: Number(product.featured),
        bestSeller: Number(product.bestSeller),
        trending: Number(product.trending),
      });
    }

    const testimonialCount = db.prepare("SELECT COUNT(*) AS count FROM testimonials").get().count;
    if (reset || testimonialCount === 0) {
      if (!reset) db.exec("DELETE FROM testimonials;");
      const insertTestimonial = db.prepare(`
        INSERT INTO testimonials (name, avatar, rating, verified, quote, posted_at, sort_order)
        VALUES (@name, @avatar, @rating, @verified, @quote, @postedAt, @sortOrder)
      `);
      for (const testimonial of testimonials) {
        insertTestimonial.run({ ...testimonial, verified: Number(testimonial.verified) });
      }
    }
  });

  seed();
  return {
    products: db.prepare("SELECT COUNT(*) AS count FROM products").get().count,
    testimonials: db.prepare("SELECT COUNT(*) AS count FROM testimonials").get().count,
  };
}