const db = require('../config/db');

// Helper function to build dynamic SQL query
const buildProductQuery = (baseQuery, filters, params) => {
  if (filters.inStock) {
    baseQuery += ' AND stock_quantity > 0';
  }

  if (filters.minPrice !== undefined) {
    baseQuery += ' AND price >= ?';
    params.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    baseQuery += ' AND price <= ?';
    params.push(filters.maxPrice);
  }

  switch (filters.sortBy) {
    case 'price_asc':
      baseQuery += ' ORDER BY price ASC';
      break;
    case 'price_desc':
      baseQuery += ' ORDER BY price DESC';
      break;
   case 'name_asc':
  baseQuery += ' ORDER BY LOWER(name) ASC';
  break;
case 'name_desc':
  baseQuery += ' ORDER BY LOWER(name) DESC';
  break;

    default:
      baseQuery += ' ORDER BY created_at DESC';
  }

  baseQuery += ' LIMIT ? OFFSET ?';
  return baseQuery;
};


// Fetch all categories
const getAllCategories = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch subcategories by category ID
const getSubcategoriesByCategoryId = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const [results] = await db.query(
      'SELECT * FROM subcategories WHERE category_id = ?',
      [categoryId]
    );
    res.status(200).json(results);
  } catch (error) {
    console.error(`Error fetching subcategories for category ${categoryId}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Fetch products by category ID with filtering and pagination
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { sortBy, inStock, minPrice, maxPrice } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE category_id = ?';
  const params = [categoryId];

  const filters = {
    sortBy,
    inStock: inStock === 'true',
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  };

  query = buildProductQuery(query, filters, params);
  params.push(limit, offset);

  try {
    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error(`Error fetching products for category ${categoryId}:`, err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch products by subcategory ID with filtering and pagination
const getProductsBySubcategory = async (req, res) => {
  const { subcategoryId } = req.params;
  const { sortBy, inStock, minPrice, maxPrice } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE subcategory_id = ?';
  const params = [subcategoryId];

  const filters = {
    sortBy,
    inStock: inStock === 'true',
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  };

  query = buildProductQuery(query, filters, params);
  params.push(limit, offset);

  try {
    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch all products with filtering and pagination
const getAllProducts = async (req, res) => {
  const { sortBy, inStock, minPrice, maxPrice } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products WHERE 1=1'; // 1=1 to make appending filters easier
  const params = [];

  const filters = {
    sortBy,
    inStock: inStock === 'true',
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
  };

  query = buildProductQuery(query, filters, params);
  params.push(limit, offset);

  try {
    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a new category
const addCategory = async (req, res) => {
  const { name } = req.body; // Remove description here
  try {
    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]  // Pass name as value here
    );
    res.status(201).json({ message: 'Category added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update category by ID
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; // Remove description

  try {
    await db.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Delete category by ID
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllCategories,
  getSubcategoriesByCategoryId,
  getProductsByCategory,
  getProductsBySubcategory,
  getAllProducts,
  addCategory,
  updateCategory,
  deleteCategory,
};
