const db = require("../config/db");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ==================== USER SIDE ====================

// Place a new order
exports.placeOrder = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, user_id } =
    req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items provided." });
  }

  if (!shippingAddress || !paymentMethod || !totalPrice || !user_id) {
    return res
      .status(400)
      .json({ message: "Missing required order information." });
  }

  try {
    const addressText = JSON.stringify(shippingAddress);
    const initialStatus = "Placed";

    // Insert into orders table
    const [orderResult] = await db.query(
      "INSERT INTO orders (shipping_address, payment_method, total_price, user_id, status) VALUES (?, ?, ?, ?, ?)",
      [addressText, paymentMethod, totalPrice, user_id, initialStatus]
    );

    const orderId = orderResult.insertId;

    // Set tracking number
    await db.query("UPDATE orders SET tracking_number = ? WHERE order_id = ?", [
      orderId,
      orderId,
    ]);

    // Insert order items
    for (const item of orderItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    // === Email sending logic ===
    const userEmail = shippingAddress?.email;

    if (userEmail && userEmail.includes("@")) {
      // Step 1: Fetch product names
      const productIds = orderItems.map((item) => item.id);
      const [productRows] = await db.query(
        `SELECT id, name FROM products WHERE id IN (${productIds
          .map(() => "?")
          .join(",")})`,
        productIds
      );

      const productMap = {};
      productRows.forEach((p) => {
        productMap[p.id] = p.name;
      });

      // Step 2: Prepare items
      const itemList = orderItems
        .map((item) => {
          const name = productMap[item.id] || "Unnamed Product";
          return `<li>${name} — ${item.quantity} x $${item.price}</li>`;
        })
        .join("");

      // Step 3: Send mail
      const mailOptions = {
        from: `"Empire Design" <${process.env.MAIL_USER}>`,
        to: userEmail,
        subject: `Empire Design - Order #${orderId} Confirmation`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color:#4A00E0;">Empire Design — Order Confirmation</h2>
            <p>Hi ${shippingAddress.firstName} ${shippingAddress.lastName},</p>
            <p>Your order <strong>#${orderId}</strong> has been successfully placed.</p>
            <h3>Order Summary:</h3>
            <ul>${itemList}</ul>
            <p><strong>Total:</strong> $${totalPrice}</p>
            <p><strong>Shipping Address:</strong><br>
              ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.deliveryCountry}<br>
              Postal Code: ${shippingAddress.postalCode}<br>
              Phone: ${shippingAddress.phone}
            </p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <hr />
            <p style="font-size: 0.9em;">You will receive further updates when your order ships.</p>
            <p>— Empire Design Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: "Order placed successfully", orderId });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Track an order
exports.trackOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        o.order_id, o.shipping_address, o.payment_method, o.total_price,
        o.status, o.created_at, oi.quantity,
        p.name AS product_name, p.image AS product_image,
        p.price AS product_price, p.model_url AS product_model_url,
        p.stock_quantity AS product_stock_quantity
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.order_id = ?`,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderInfo = {
      order_id: rows[0].order_id,
      shipping_address: rows[0].shipping_address,
      payment_method: rows[0].payment_method,
      total_price: rows[0].total_price,
      created_at: rows[0].created_at,
      status: rows[0].status,
    };

    const products = rows.map((row) => ({
      product_name: row.product_name,
      product_image: row.product_image,
      product_price: row.product_price,
      product_model_url: row.product_model_url,
      product_stock_quantity: row.product_stock_quantity,
      quantity: row.quantity,
    }));

    res.json({ ...orderInfo, products });
  } catch (err) {
    console.error("Error tracking order:", err);
    res.status(500).json({ message: "Error tracking order" });
  }
};

// ==================== ADMIN SIDE ====================

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const query = "SELECT * FROM orders";
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID with items
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const orderQuery = "SELECT * FROM orders WHERE order_id = ?";
    const itemsQuery = `
      SELECT oi.quantity, oi.price, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    const [orderResults] = await db.query(orderQuery, [orderId]);

    if (orderResults.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResults[0];

    if (typeof order.shipping_address !== "string") {
      order.shipping_address = JSON.stringify(order.shipping_address || {});
    }

    const [itemsResults] = await db.query(itemsQuery, [orderId]);
    order.items = itemsResults || [];
    res.json(order);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updateQuery = "UPDATE orders SET status = ? WHERE order_id = ?";
    await db.query(updateQuery, [status, orderId]);
    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json({ error: "Failed to update order status" });
  }
};
