import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { Product } from "../models/Product.js";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImagesToCloudinary() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");

  const products = await Product.find({});
  console.log(`Found ${products.length} products to update.`);

  for (const product of products) {
    console.log(`\nProcessing ${product.name}...`);
    let updated = false;

    // Check main image
    if (product.image && !product.image.includes('cloudinary')) {
      console.log(`Uploading main image to Cloudinary...`);
      try {
        const result = await cloudinary.uploader.upload(product.image, { folder: "nova/products" });
        product.image = result.secure_url;
        updated = true;
        console.log(`Main image uploaded: ${product.image}`);
      } catch (err) {
        console.error(`Failed to upload main image for ${product.name}:`, err.message);
      }
    }

    // Check images array
    if (product.images_json) {
      let imagesArray = JSON.parse(product.images_json);
      let newImagesArray = [];
      let arrayUpdated = false;

      for (const imgUrl of imagesArray) {
        if (!imgUrl.includes('cloudinary')) {
          console.log(`Uploading gallery image to Cloudinary...`);
          try {
            const result = await cloudinary.uploader.upload(imgUrl, { folder: "nova/products" });
            newImagesArray.push(result.secure_url);
            arrayUpdated = true;
            console.log(`Gallery image uploaded: ${result.secure_url}`);
          } catch (err) {
            console.error(`Failed to upload gallery image for ${product.name}:`, err.message);
            newImagesArray.push(imgUrl); // Keep old URL if it fails
          }
        } else {
          newImagesArray.push(imgUrl);
        }
      }

      if (arrayUpdated) {
        product.images_json = JSON.stringify(newImagesArray);
        updated = true;
      }
    }

    if (updated) {
      await product.save();
      console.log(`Successfully updated ${product.name} in database.`);
    } else {
      console.log(`No images needed updating for ${product.name}.`);
    }
  }

  console.log("\nAll images have been processed and uploaded to Cloudinary!");
  await mongoose.disconnect();
  process.exit(0);
}

uploadImagesToCloudinary().catch(error => {
  console.error("Failed to upload images:", error);
  process.exit(1);
});
