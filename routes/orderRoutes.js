// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ==================== USER SIDE ====================

// Place an order
router.post('/place-order', orderController.placeOrder);

// Track an order by ID
router.get('/track/:orderId', orderController.trackOrder);

// ==================== ADMIN SIDE ====================

// Get all orders
router.get('/', orderController.getAllOrders);

// Get specific order by ID (with items)
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id', orderController.updateOrderStatus);

module.exports = router;
