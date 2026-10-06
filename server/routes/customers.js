import { Router } from "express";
import { Order } from "../models/Order.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/customers
router.get("/", authenticateAdmin, async (req, res, next) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer_email",
          email: { $first: "$customer_email" },
          name: { $first: "$customer_name" },
          phone: { $first: "$customer_phone" },
          city: { $first: "$shipping_city" },
          state: { $first: "$shipping_state" },
          total_orders: { $sum: 1 },
          total_spent: { $sum: "$total" },
          last_order_date: { $max: "$created_at" }
        }
      },
      { $sort: { last_order_date: -1 } }
    ]);
    
    res.json(customers);
  } catch (error) {
    return next(error);
  }
});

// GET /api/customers/:email
router.get("/:email", authenticateAdmin, async (req, res, next) => {
  try {
    const email = req.params.email;
    
    // RegExp for case-insensitive match
    const customerOrders = await Order.find({ 
      customer_email: { $regex: new RegExp(`^${email}$`, "i") } 
    }).sort({ created_at: -1 });
    
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
        dbId: o._id,
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
