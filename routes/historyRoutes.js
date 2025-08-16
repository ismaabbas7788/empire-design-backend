const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController"); // ✅ Correct name now

router.get("/orders/history/:userId", historyController.getUserOrderHistory);

module.exports = router;
