const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", contactController.submitContactForm);
router.get("/all", contactController.getAllMessages);
router.post("/reply/:id", contactController.sendReplyToUser);

module.exports = router;
