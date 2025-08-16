const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET all categories
router.get('/', categoryController.getAllCategories);

// GET subcategories by category ID
router.get('/:id/subcategories', categoryController.getSubcategoriesByCategoryId);

// ✅ Route to get products for a specific subcategory
router.get('/all-products', categoryController.getAllProducts);

router.get('/subcategories/:subcategoryId/products', categoryController.getProductsBySubcategory);
router.get('/:categoryId/products', categoryController.getProductsByCategory);

// POST: Add a new category
router.post('/', categoryController.addCategory);

// PUT: Update an existing category by ID
router.put('/:id', categoryController.updateCategory);

// DELETE: Delete a category by ID
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
