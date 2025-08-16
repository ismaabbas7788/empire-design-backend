const db = require('../config/db');


const getAllProducts = async (req, res) => {
  try {
    const { subcategoryId } = req.query;
    let query = 'SELECT * FROM products';
    let params = [];

    if (subcategoryId) {
      query += ' WHERE subcategory_id = ?';
      params.push(subcategoryId);
    }

    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Dynamically add a product
const addProduct = async (req, res) => {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM products`);
    const columnNames = columns
      .filter(col => col.Extra !== 'auto_increment')
      .map(col => col.Field);

    const input = req.body;

    // Remove 'created_at' from insertable fields, so DB sets it automatically
    const filteredColumnNames = columnNames.filter(field => field !== 'created_at');

    // Filter fields and values only for allowed columns (excluding created_at)
    const fieldsToInsert = filteredColumnNames.filter(field => input[field] !== undefined);
    const valuesToInsert = fieldsToInsert.map(field => input[field]);

    if (fieldsToInsert.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    const placeholders = fieldsToInsert.map(() => '?').join(', ');
    const sql = `INSERT INTO products (${fieldsToInsert.join(', ')}) VALUES (${placeholders})`;

    const [result] = await db.query(sql, valuesToInsert);
    res.status(201).json({ message: 'Product added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all product table columns (for dynamic form)
const getProductColumns = async (req, res) => {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM products`);
    res.status(200).json(columns);
  } catch (error) {
    console.error('Error fetching product columns:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Dynamically update a product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const input = req.body;

    const [columns] = await db.query(`SHOW COLUMNS FROM products`);
    const columnNames = columns
      .filter(col => col.Field !== 'id' && col.Extra !== 'auto_increment')
      .map(col => col.Field);

    const fieldsToUpdate = columnNames.filter(field => input[field] !== undefined);
    const values = fieldsToUpdate.map(field => input[field]);

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updateQuery = `UPDATE products SET ${fieldsToUpdate.map(field => `${field} = ?`).join(', ')} WHERE id = ?`;
    values.push(productId);

    const [result] = await db.query(updateQuery, values);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getTopSellers = (req, res) => {
  const query = `
    SELECT 
      p.id, p.name, p.price, p.image, SUM(oi.quantity) AS total_sold
    FROM 
      products p
    JOIN 
      order_items oi ON p.id = oi.product_id
    GROUP BY 
      p.id
    ORDER BY 
      total_sold DESC
    LIMIT 4;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching top sellers:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.json(results);
  });
};

// GET most recent products
const getRecentProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT 8'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recent products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getProductById,
  getTopSellers,
  getRecentProducts,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductColumns
};
