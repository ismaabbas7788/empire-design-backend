const express = require("express");
const router = express.Router();
const subcategoriesController = require("../controllers/subcategoriesController");

// GET all subcategories
router.get("/", subcategoriesController.getAllSubcategories);

// ADD subcategory
router.post("/", subcategoriesController.addSubcategory);

// UPDATE subcategory
router.put("/:id", subcategoriesController.updateSubcategory);

// DELETE subcategory
router.delete("/:id", subcategoriesController.deleteSubcategory);

module.exports = router;
