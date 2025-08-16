// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

// Routes
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateQuantity);
router.delete('/remove/:id', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
