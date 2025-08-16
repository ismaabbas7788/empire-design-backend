// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Order matters: more specific routes first
router.get('/top-sellers', productController.getTopSellers);
router.get('/recent', productController.getRecentProducts);
// Important: Place /columns before /:id to avoid route conflict
router.get('/columns', productController.getProductColumns);

// GET all products or filter by subcategoryId
router.get('/', productController.getAllProducts);

// POST new product
router.post('/', productController.addProduct);
router.get('/:id', productController.getProductById);


// PUT update existing product by ID
router.put('/:id', productController.updateProduct);

// DELETE product by ID
router.delete('/:id', productController.deleteProduct);


module.exports = router;
