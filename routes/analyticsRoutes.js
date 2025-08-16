const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/total-users", analyticsController.getTotalUsers);
router.get("/total-orders", analyticsController.getTotalOrders);
router.get("/total-revenue", analyticsController.getTotalRevenue);
router.get("/sales-summary", analyticsController.getSalesSummary);
router.get("/top-products", analyticsController.getTopProducts);
router.get('/sales-by-product', analyticsController.getSalesByProduct);
router.get("/category-sales", analyticsController.getCategorySales);
router.get("/category-details/:categoryId", analyticsController.getCategoryDetails);
router.get("/user-report", analyticsController.getUserReport);
router.get("/orders-report", analyticsController.getOrdersReport);
router.get("/sales-data", analyticsController.getSalesData);


module.exports = router;
