import { Router } from "express";
import { getDB } from "../config/db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/customers
router.get("/", authenticateAdmin, (req, res, next) => {
  try {
    const db = getDB();
    
    // We get unique customers from orders table
    const rows = db.prepare(`
      SELECT 
        customer_email as email,
        customer_name as name,
        customer_phone as phone,
        shipping_city as city,
        shipping_state as state,
        COUNT(id) as total_orders,
        SUM(total) as total_spent,
        MAX(created_at) as last_order_date
      FROM orders
      GROUP BY customer_email
      ORDER BY last_order_date DESC
    `).all();

    res.json(rows);
  } catch (error) {
    return next(error);
  }
});

// GET /api/customers/:email
router.get("/:email", authenticateAdmin, (req, res, next) => {
  try {
    const email = req.params.email;
    const db = getDB();
    
    const customerOrders = db.prepare("SELECT * FROM orders WHERE customer_email = ? COLLATE NOCASE ORDER BY created_at DESC").all(email);
    
    if (customerOrders.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const latest = customerOrders[0];
    
    const customer = {
      email: latest.customer_email,
      name: latest.customer_name,
      phone: latest.customer_phone,
      address: latest.shipping_address,
      city: latest.shipping_city,
      state: latest.shipping_state,
      postal: latest.shipping_postal,
      total_orders: customerOrders.length,
      total_spent: customerOrders.reduce((sum, o) => sum + o.total, 0),
      orders: customerOrders.map(o => ({
        id: o.order_number,
        dbId: o.id,
        date: o.created_at,
        total: o.total,
        status: o.status
      }))
    };

    res.json(customer);
  } catch (error) {
    return next(error);
  }
});

export default router;
