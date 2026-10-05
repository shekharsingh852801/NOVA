import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/nova.sqlite');
const db = new Database(dbPath);

console.log('Seeding products and orders...');

// =======================
// 1. Seed Products
// =======================
const products = [
  {
    slug: 'essential-crewneck-tee',
    name: 'Essential Crewneck Tee',
    subcategory: 'T-Shirts',
    price: 1499,
    compare_at_price: 1999,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify(['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
    tag: 'Bestseller',
    colors_json: JSON.stringify(['Black', 'White', 'Charcoal']),
    sizes_json: JSON.stringify(['S', 'M', 'L', 'XL']),
    description: 'The perfect everyday tee made from 100% organic cotton.',
    material: '100% Organic Cotton',
    fit: 'Regular Fit',
    care: 'Machine wash cold',
    rating: 4.8,
    reviews: 124,
    stock: 50,
    tags_json: JSON.stringify(['t-shirt', 'casual', 'organic']),
    category: 'men',
    is_new_arrival: 0,
    new_arrival: 0,
    featured: 1,
    best_seller: 1,
    trending: 1,
    sort_order: 1
  },
  {
    slug: 'relaxed-fit-denim',
    name: 'Relaxed Fit Denim Jeans',
    subcategory: 'Jeans',
    price: 2999,
    compare_at_price: 3499,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify(['https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
    tag: 'New',
    colors_json: JSON.stringify(['Washed indigo']),
    sizes_json: JSON.stringify(['30', '32', '34', '36']),
    description: 'Classic relaxed fit denim for ultimate comfort.',
    material: '98% Cotton, 2% Elastane',
    fit: 'Relaxed Fit',
    care: 'Wash inside out',
    rating: 4.5,
    reviews: 86,
    stock: 12,
    tags_json: JSON.stringify(['denim', 'jeans', 'casual']),
    category: 'men',
    is_new_arrival: 1,
    new_arrival: 1,
    featured: 1,
    best_seller: 0,
    trending: 1,
    sort_order: 2
  },
  {
    slug: 'heavyweight-hoodie',
    name: 'Heavyweight Pullover Hoodie',
    subcategory: 'Hoodies',
    price: 3599,
    compare_at_price: 4000,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify(['https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
    tag: 'Trending',
    colors_json: JSON.stringify(['Ash', 'Olive', 'Black']),
    sizes_json: JSON.stringify(['M', 'L', 'XL', 'XXL']),
    description: 'Premium heavyweight hoodie for cold weather layering.',
    material: '80% Cotton, 20% Polyester',
    fit: 'Oversized Fit',
    care: 'Machine wash warm',
    rating: 4.9,
    reviews: 210,
    stock: 8,
    tags_json: JSON.stringify(['hoodie', 'winter', 'streetwear']),
    category: 'men',
    is_new_arrival: 0,
    new_arrival: 0,
    featured: 1,
    best_seller: 1,
    trending: 1,
    sort_order: 3
  },
  {
    slug: 'minimalist-sneakers',
    name: 'Minimalist Leather Sneakers',
    subcategory: 'Shoes',
    price: 4999,
    compare_at_price: 5500,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images_json: JSON.stringify(['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
    tag: '',
    colors_json: JSON.stringify(['White', 'Black']),
    sizes_json: JSON.stringify(['7', '8', '9', '10', '11']),
    description: 'Clean, simple, and elegant sneakers crafted from premium leather.',
    material: '100% Genuine Leather',
    fit: 'True to size',
    care: 'Wipe with damp cloth',
    rating: 4.7,
    reviews: 45,
    stock: 35,
    tags_json: JSON.stringify(['shoes', 'sneakers', 'leather']),
    category: 'accessories',
    is_new_arrival: 1,
    new_arrival: 1,
    featured: 0,
    best_seller: 0,
    trending: 0,
    sort_order: 4
  }
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    slug, name, subcategory, price, compare_at_price, image, images_json,
    tag, colors_json, sizes_json, description, material, fit, care,
    rating, reviews, stock, tags_json, category, is_new_arrival, new_arrival,
    featured, best_seller, trending, sort_order
  ) VALUES (
    @slug, @name, @subcategory, @price, @compare_at_price, @image, @images_json,
    @tag, @colors_json, @sizes_json, @description, @material, @fit, @care,
    @rating, @reviews, @stock, @tags_json, @category, @is_new_arrival, @new_arrival,
    @featured, @best_seller, @trending, @sort_order
  )
`);

products.forEach(p => insertProduct.run(p));
console.log(`Seeded ${products.length} products.`);


// =======================
// 2. Seed Orders
// =======================
const statuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const orders = [
  {
    order_number: 'ORD-10001',
    customer_name: 'Rahul Sharma',
    customer_email: 'rahul.sharma@example.com',
    customer_phone: '+919876543210',
    shipping_address: '123 Tech Park, Sector 4',
    shipping_city: 'Gurugram',
    shipping_state: 'Haryana',
    shipping_postal: '122001',
    items_json: JSON.stringify([
      { id: 'essential-crewneck-tee', name: 'Essential Crewneck Tee', price: 1499, quantity: 2, size: 'L', color: 'Black' }
    ]),
    subtotal: 2998,
    shipping: 100,
    total: 3098,
    payment_method: 'pay_on_delivery',
    payment_status: 'pending',
    status: 'delivered',
    progress: 6,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    order_number: 'ORD-10002',
    customer_name: 'Priya Patel',
    customer_email: 'priya.patel@example.com',
    customer_phone: '+919876543211',
    shipping_address: 'Flat 405, Palm Heights',
    shipping_city: 'Mumbai',
    shipping_state: 'Maharashtra',
    shipping_postal: '400050',
    items_json: JSON.stringify([
      { id: 'heavyweight-hoodie', name: 'Heavyweight Pullover Hoodie', price: 3599, quantity: 1, size: 'M', color: 'Olive' },
      { id: 'minimalist-sneakers', name: 'Minimalist Leather Sneakers', price: 4999, quantity: 1, size: '7', color: 'White' }
    ]),
    subtotal: 8598,
    shipping: 0,
    total: 8598,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'shipped',
    progress: 4,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    order_number: 'ORD-10003',
    customer_name: 'Amit Kumar',
    customer_email: 'amit.kumar@example.com',
    customer_phone: '+919876543212',
    shipping_address: 'House No 12, MG Road',
    shipping_city: 'Bengaluru',
    shipping_state: 'Karnataka',
    shipping_postal: '560001',
    items_json: JSON.stringify([
      { id: 'relaxed-fit-denim', name: 'Relaxed Fit Denim Jeans', price: 2999, quantity: 1, size: '32', color: 'Washed indigo' }
    ]),
    subtotal: 2999,
    shipping: 150,
    total: 3149,
    payment_method: 'pay_on_delivery',
    payment_status: 'paid',
    status: 'confirmed',
    progress: 2,
    created_at: new Date().toISOString()
  },
  {
    order_number: 'ORD-10004',
    customer_name: 'Rahul Sharma',
    customer_email: 'rahul.sharma@example.com',
    customer_phone: '+919876543210',
    shipping_address: '123 Tech Park, Sector 4',
    shipping_city: 'Gurugram',
    shipping_state: 'Haryana',
    shipping_postal: '122001',
    items_json: JSON.stringify([
      { id: 'essential-crewneck-tee', name: 'Essential Crewneck Tee', price: 1499, quantity: 1, size: 'L', color: 'White' }
    ]),
    subtotal: 1499,
    shipping: 150,
    total: 1649,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    status: 'cancelled',
    progress: 1,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const insertOrder = db.prepare(`
  INSERT OR IGNORE INTO orders (
    order_number, customer_name, customer_email, customer_phone, shipping_address,
    shipping_city, shipping_state, shipping_postal, items_json, subtotal, shipping,
    total, payment_method, payment_status, status, progress, created_at
  ) VALUES (
    @order_number, @customer_name, @customer_email, @customer_phone, @shipping_address,
    @shipping_city, @shipping_state, @shipping_postal, @items_json, @subtotal, @shipping,
    @total, @payment_method, @payment_status, @status, @progress, @created_at
  )
`);

orders.forEach(o => insertOrder.run(o));
console.log(`Seeded ${orders.length} orders.`);

console.log('Database seeding complete!');
