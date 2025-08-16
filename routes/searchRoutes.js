const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/searchController');

// GET /api/search?search=chair
router.get('/search', searchProducts);

module.exports = router;
