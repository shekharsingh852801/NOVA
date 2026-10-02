import { shopProducts } from "../data/products.js";

export const adminNavGroups = [
  {
    group: "Overview",
    items: [{ id: "dashboard", label: "Dashboard" }],
  },
  {
    group: "COMMERCE",
    items: [
      { id: "orders", label: "Orders" },
      { id: "products", label: "Products" },
      { id: "inventory", label: "Inventory" },
      { id: "customers", label: "Customers" },
      { id: "discounts", label: "Discounts" },
      { id: "returns", label: "Returns & Refunds" },
    ],
  },
  {
    group: "CATALOG",
    items: [
      { id: "categories", label: "Categories" },
      { id: "collections", label: "Collections" },
      { id: "size-guides", label: "Size Guides" },
      { id: "shop-the-look", label: "Shop the Look" },
    ],
  },
  {
    group: "CONTENT",
    items: [
      { id: "homepage", label: "Homepage" },
      { id: "lookbook", label: "Lookbook" },
      { id: "journal", label: "Journal" },
      { id: "reviews", label: "Reviews" },
    ],
  },
  {
    group: "ANALYTICS",
    items: [{ id: "analytics", label: "Sales Analytics" }],
  },
  {
    group: "SETTINGS",
    items: [
      { id: "shipping", label: "Shipping" },
      { id: "payments", label: "Payments" },
      { id: "settings", label: "Store Settings" },
      { id: "admin", label: "Admin & Permissions" },
      { id: "notifications", label: "Notifications" },
    ],
  },
];

export const adminDashboardMetrics = [
  { label: "Total Revenue", value: "₹2,48,750", change: "+12.5%", trend: "up", comparison: "vs last week" },
  { label: "Today's Revenue", value: "₹68,420", change: "+8.3%", trend: "up", comparison: "vs yesterday" },
  { label: "Total Orders", value: "248", change: "+15.2%", trend: "up", comparison: "vs last week" },
  { label: "Today's Orders", value: "42", change: "+20.0%", trend: "up", comparison: "vs yesterday" },
  { label: "Total Customers", value: "1,342", change: "+11.7%", trend: "up", comparison: "vs last week" },
];

export const adminSalesSeries = [90, 135, 110, 165, 148, 218, 205];

export const adminOrderStatus = [
  { label: "Pending", value: 32, color: "#6b7cff" },
  { label: "Confirmed", value: 54, color: "#6ec5ff" },
  { label: "Processing", value: 48, color: "#f2c27d" },
  { label: "Shipped", value: 62, color: "#8cd5c2" },
  { label: "Delivered", value: 38, color: "#74d69d" },
  { label: "Cancelled", value: 3, color: "#ef8d7a" },
  { label: "Returned", value: 5, color: "#d786e6" },
];

export const topProducts = shopProducts.slice(0, 5).map((product, index) => ({
  name: product.name,
  sold: [1248, 982, 764, 612, 431][index],
  revenue: ["₹24,000", "₹16,700", "₹15,200", "₹14,600", "₹12,200"][index],
  trend: ["+18%", "+12%", "+9%", "+15%", "+6%"][index],
  image: product.images?.[0],
}));

export const categoryPerformance = [
  { name: "Men's Tops", orders: 86, revenue: "₹48,92,000", change: "+18%" },
  { name: "Men's Bottoms", orders: 42, revenue: "₹31,20,000", change: "+12%" },
  { name: "Women's Tops", orders: 62, revenue: "₹27,17,000", change: "+15%" },
  { name: "Accessories", orders: 28, revenue: "₹12,84,000", change: "+9%" },
];

export const lowStockProducts = [
  { name: "Essential Hoodie", stock: 6, status: "Low Stock" },
  { name: "Cargo Pants", stock: 4, status: "Low Stock" },
  { name: "Denim Jacket", stock: 2, status: "Low Stock" },
  { name: "Basic Tee", stock: 0, status: "Out of Stock" },
];

export const recentOrders = [
  { id: "#NOVA-2487", customer: "Rohan Mehta", amount: "₹4,299", status: "Shipped" },
  { id: "#NOVA-2486", customer: "Priya Sharma", amount: "₹2,199", status: "Processing" },
  { id: "#NOVA-2485", customer: "Aarav Singh", amount: "₹6,499", status: "Confirmed" },
  { id: "#NOVA-2484", customer: "Sneha Patel", amount: "₹3,999", status: "Delivered" },
  { id: "#NOVA-2483", customer: "Karan Verma", amount: "₹5,249", status: "Pending" },
];

export const adminCustomers = [
  { name: "Rohan Mehta", orders: 8, spend: "₹14,620", lastOrder: "2 days ago" },
  { name: "Priya Sharma", orders: 5, spend: "₹12,890", lastOrder: "4 days ago" },
  { name: "Aarav Singh", orders: 7, spend: "₹7,660", lastOrder: "5 days ago" },
  { name: "Sneha Patel", orders: 4, spend: "₹3,870", lastOrder: "1 week ago" },
];

export const adminProducts = shopProducts.map((product, index) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: `₹${product.price}`,
  stock: product.stock,
  status: index % 4 === 0 ? "Draft" : "Active",
  category: product.category,
  featured: product.featured,
  sku: `NOVA-${(index + 1).toString().padStart(4, "0")}`,
  image: product.image,
}));

export const inventoryItems = [
  { name: "Essential Hoodie", variant: "Stone / M", stock: 12, threshold: 8, status: "Available" },
  { name: "Cargo Pants", variant: "Field / 32", stock: 5, threshold: 8, status: "Low Stock" },
  { name: "Denim Jacket", variant: "Indigo / L", stock: 2, threshold: 6, status: "Low Stock" },
  { name: "Basic Tee", variant: "Black / M", stock: 0, threshold: 8, status: "Out of Stock" },
];

export const adminDiscounts = [
  { code: "NOVA10", type: "Percentage", value: "10%", status: "Active", start: "01 Apr", end: "30 Apr" },
  { code: "WELCOME50", type: "Fixed", value: "₹500", status: "Draft", start: "15 Apr", end: "15 May" },
  { code: "FREESHIP", type: "Shipping", value: "Free", status: "Active", start: "05 Apr", end: "21 Apr" },
];

export const adminNotifications = [
  { title: "New order", detail: "#NOVA-2487 needs fulfilment", tag: "Order" },
  { title: "Low stock", detail: "Cargo Pants is below reorder threshold", tag: "Inventory" },
  { title: "New review", detail: "3 reviews awaiting moderation", tag: "Reviews" },
  { title: "Return request", detail: "Customer requested return for #NOVA-2478", tag: "Returns" },
];

export const adminPlaceholderBlocks = [
  { title: "Product Collections", value: "08" },
  { title: "Live storefront changes", value: "24" },
  { title: "Pending reviews", value: "12" },
];

export const getAdminData = async () => ({
  metrics: adminDashboardMetrics,
  salesSeries: adminSalesSeries,
  statusBreakdown: adminOrderStatus,
  products: adminProducts,
  orders: recentOrders,
  customers: adminCustomers,
  inventory: inventoryItems,
  discounts: adminDiscounts,
  notifications: adminNotifications,
});
