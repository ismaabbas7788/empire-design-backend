// controllers/orderController.js
const db = require("../config/db");

exports.getUserOrderHistory = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        o.order_id, o.shipping_address, o.payment_method, o.total_price,
        o.status, o.created_at, oi.quantity,
        p.name AS product_name, p.image AS product_image,
        p.price AS product_price
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json([]); // no orders
    }

    const ordersMap = {};

    for (const row of rows) {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          shipping_address: row.shipping_address,
          payment_method: row.payment_method,
          total_price: row.total_price,
          created_at: row.created_at,
          status: row.status,
          products: [],
        };
      }

      ordersMap[row.order_id].products.push({
        product_name: row.product_name,
        product_image: row.product_image,
        product_price: row.product_price,
        quantity: row.quantity,
      });
    }

    const ordersArray = Object.values(ordersMap);
    res.json(ordersArray);
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ message: "Error fetching order history" });
  }
};
