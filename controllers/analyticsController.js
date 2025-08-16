const db = require("../config/db");
const PDFDocument = require("pdfkit");

// =========================
// Total Users
// =========================
exports.getTotalUsers = (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM register", (err, result) => {
    if (err) {
      console.error("Error fetching total users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ total: result[0].total });
  });
};

// =========================
// Total Orders
// =========================
exports.getTotalOrders = (req, res) => {
  const query = "SELECT COUNT(*) AS totalOrders FROM orders";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching total orders:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ totalOrders: results[0].totalOrders });
  });
};

// =========================
// Total Revenue
// =========================
exports.getTotalRevenue = (req, res) => {
  const query = "SELECT SUM(total_price) AS revenue FROM orders";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch revenue" });
    }
    res.json({ revenue: results[0].revenue || 0 });
  });
};

// =========================
// Sales Summary
// =========================
exports.getSalesSummary = (req, res) => {
  const query = `
    SELECT 
      SUM(total_price) AS totalSales,
      COUNT(*) AS totalOrders,
      AVG(total_price) AS averageOrderValue,
      MAX(total_price) AS highestOrder,
      SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_price ELSE 0 END) AS todaySales,
      SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN total_price ELSE 0 END) AS weekSales,
      SUM(CASE WHEN YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN total_price ELSE 0 END) AS monthSales
    FROM orders
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales summary:", err);
      return res.status(500).json({ error: "Failed to fetch sales summary" });
    }
    res.json(results[0]);
  });
};

// =========================
// Top Products
// =========================
exports.getTopProducts = (req, res) => {
  const query = `
    SELECT p.id, p.name, p.image, SUM(oi.quantity) AS sales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.image
    ORDER BY sales DESC
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("🔥 Error in /top-products route:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ products: results });
  });
};

// =========================
// Category Sales
// =========================
exports.getCategorySales = (req, res) => {
  const query = `
    SELECT 
    c.id AS categoryId,       -- 🔹 Add this
    c.name AS category,
    SUM(oi.quantity) AS totalSales
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY totalSales DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching category sales:", err);
      return res.status(500).json({ error: "Failed to fetch category sales" });
    }
    res.json({ data: results });
  });
};


// =========================
// User Report PDF
// =========================
exports.getUserReport = async (req, res) => {
  try {
    const totalUsersResult = await new Promise((resolve, reject) => {
      db.query("SELECT COUNT(*) AS total FROM register", (err, result) => {
        if (err) reject(err);
        else resolve(result[0].total);
      });
    });

    const recentSignupsResult = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(*) AS recent FROM register WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0].recent);
        }
      );
    });

    const userDetails = await new Promise((resolve, reject) => {
      db.query(
        "SELECT firstName, email, phone FROM register ORDER BY createdAt DESC LIMIT 50",
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=user_analytics_report.pdf");
    doc.pipe(res);

    doc.fontSize(22).text("User Analytics Report", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(16).text(`Total Users: ${totalUsersResult}`);
    doc.moveDown();
    doc.text(`New Users (Last 30 days): ${recentSignupsResult}`);
    doc.moveDown(2);

    doc.fontSize(18).text("User Details", { underline: true });
    doc.moveDown(0.5);

    const startX = 50;
    let startY = doc.y;
    const colWidths = { name: 120, email: 230, phone: 160 };

    doc.rect(startX - 5, startY - 5, colWidths.name + colWidths.email + colWidths.phone + 20, 25)
      .fill("#f0f0f0")
      .fillColor("#000");

    doc.fontSize(14).font("Helvetica-Bold")
      .text("Name", startX, startY, { width: colWidths.name, align: "left" })
      .text("Email", startX + colWidths.name + 10, startY, { width: colWidths.email, align: "left" })
      .text("Mobile Number", startX + colWidths.name + colWidths.email + 20, startY, { width: colWidths.phone, align: "left" });

    startY += 25;
    doc.moveTo(startX - 5, startY).lineTo(startX - 5 + colWidths.name + colWidths.email + colWidths.phone + 20, startY).stroke();
    doc.font("Helvetica").fontSize(12);

    userDetails.forEach(user => {
      doc.text(user.firstName || "-", startX, startY, { width: colWidths.name });
      doc.text(user.email || "-", startX + colWidths.name + 10, startY, { width: colWidths.email });
      doc.text(user.phone || "-", startX + colWidths.name + colWidths.email + 20, startY, { width: colWidths.phone });

      startY += 20;
      doc.moveTo(startX - 5, startY).lineTo(startX - 5 + colWidths.name + colWidths.email + colWidths.phone + 20, startY).stroke();

      if (startY > 750) {
        doc.addPage();
        startY = 50;
      }
    });

    doc.end();
  } catch (error) {
    console.error("Error generating user report PDF:", error);
    res.status(500).json({ error: "Failed to generate user report" });
  }
};

// =========================
// Orders Report PDF
// =========================
exports.getOrdersReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.order_id AS orderId,
        r.firstName AS customerName,
        o.total_price,
        o.status,
        o.created_at,
        p.name AS productName,
        oi.quantity
      FROM orders o
      JOIN register r ON o.user_id = r.id
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC, o.order_id, p.name
    `;

    const orders = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders_report.pdf");
    doc.pipe(res);

    doc.fontSize(22).font("Helvetica-Bold").text("Orders Report", { align: "center" });
    doc.moveDown(1.5);

    let y = doc.y;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    const checkPageSpace = (heightNeeded = 100) => {
      if (y + heightNeeded > pageHeight) {
        doc.addPage();
        y = doc.y;
      }
    };

    const groupedOrders = {};
    for (const row of orders) {
      if (!groupedOrders[row.orderId]) {
        groupedOrders[row.orderId] = {
          orderId: row.orderId,
          customerName: row.customerName,
          total_price: row.total_price,
          status: row.status,
          created_at: row.created_at,
          products: [],
        };
      }
      groupedOrders[row.orderId].products.push({
        productName: row.productName,
        quantity: row.quantity,
      });
    }

    const orderList = Object.values(groupedOrders);

    orderList.forEach((order, idx) => {
      checkPageSpace(110);

      doc.fontSize(14).fillColor("#003366").font("Helvetica-Bold")
        .text("Order ID: ", { continued: true })
        .font("Helvetica").text(order.orderId);

      doc.font("Helvetica-Bold").text("Customer: ", { continued: true })
        .font("Helvetica").text(order.customerName || "-");

      doc.font("Helvetica-Bold").text("Total Price: ", { continued: true })
        .font("Helvetica").text(`$${order.total_price.toFixed(2)}`, { continued: true });

      doc.font("Helvetica-Bold").text("   Status: ", { continued: true })
        .font("Helvetica").text(order.status);

      doc.font("Helvetica-Bold").text("Order Date: ", { continued: true })
        .font("Helvetica").text(new Date(order.created_at).toLocaleDateString());

      doc.moveDown(0.5);

      doc.fontSize(13).fillColor("#555555").font("Helvetica-Bold").text("Products:", { underline: true });

      order.products.forEach((prod) => {
        doc.fontSize(12).fillColor("black").font("Helvetica")
          .list([`${prod.productName} (Quantity: ${prod.quantity})`], { bulletIndent: 15, textIndent: 25 });
      });

      doc.moveDown(1.2);
      y = doc.y;

      if (idx < orderList.length - 1) {
        doc.strokeColor("#cccccc").lineWidth(1)
          .moveTo(doc.page.margins.left, y)
          .lineTo(doc.page.width - doc.page.margins.right, y)
          .stroke();
        doc.moveDown(1);
        y = doc.y;
      }
    });

    doc.end();
  } catch (error) {
    console.error("Error generating orders report:", error);
    res.status(500).json({ error: "Failed to generate orders report" });
  }
};
// =========================
// Paginated Sales Data with Optional Date Filter
// =========================
exports.getSalesData = (req, res) => {
  let { startDate, endDate, page = 1, limit = 20 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let baseQuery = `
    SELECT 
      o.order_id,
      o.created_at,
      r.firstName AS customerName,
      p.name AS productName,
      oi.quantity,
      o.total_price,
      o.status
    FROM orders o
    JOIN register r ON o.user_id = r.id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.id
  `;

  let countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
  `;

  // Conditions array for WHERE clauses
  let conditions = [];
  let params = [];

  if (startDate && endDate) {
    conditions.push("DATE(o.created_at) BETWEEN ? AND ?");
    params.push(startDate, endDate);
  }

  // Build WHERE clause if any
  if (conditions.length > 0) {
    const whereClause = " WHERE " + conditions.join(" AND ");
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  // Add ORDER, LIMIT and OFFSET
  baseQuery += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  // Execute both queries - data and total count
  db.query(baseQuery, params, (err, results) => {
    if (err) {
      console.error("Error fetching sales data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Fetch total count separately
    db.query(countQuery, params.slice(0, params.length - 2), (err2, countResults) => {
      if (err2) {
        console.error("Error fetching sales count:", err2);
        return res.status(500).json({ error: "Database error" });
      }

      const totalCount = countResults[0].totalCount;
      res.json({ data: results, total: totalCount, page, limit });
    });
  });
};

exports.getSalesByProduct = (req, res) => {
  let { startDate, endDate } = req.query;
  let params = [];
  let whereClause = "";

  if (startDate && endDate) {
    whereClause = "WHERE DATE(o.created_at) BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  const query = `
    SELECT
      p.id AS productId,
      p.name AS productName,
      SUM(oi.quantity) AS totalQuantity,
      SUM(oi.quantity * oi.price) AS totalRevenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN products p ON oi.product_id = p.id
    ${whereClause}
    GROUP BY p.id, p.name
    ORDER BY totalRevenue DESC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching sales by product:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ data: results });
  });
};


exports.getCategoryDetails = (req, res) => {
  const categoryId = req.params.categoryId;

  const query = `
    SELECT 
      p.id AS productId,
      p.name AS productName,
      sc.id AS subcategoryId,
      sc.name AS subcategoryName,
      SUM(oi.quantity) AS totalQuantitySold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.category_id = ?
    GROUP BY p.id, p.name, sc.id, sc.name
    ORDER BY totalQuantitySold DESC
  `;

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.error("Error fetching category details:", err);
      return res.status(500).json({ error: "Failed to fetch category details" });
    }
    res.json({ data: results });
  });
};