const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory
} = require("../controllers/categoriesController");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);

module.exports = router;
