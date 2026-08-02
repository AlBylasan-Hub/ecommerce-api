const pool = require("../config/database");

async function getCategories(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, name, description, is_active, created_at
      FROM categories
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories"
    });
  }
}

async function getCategoryById(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category"
    });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const result = await pool.query(`
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [name, description || null]);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const { name, description, is_active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const result = await pool.query(`
      UPDATE categories
      SET name = $1,
          description = $2,
          is_active = $3
      WHERE id = $4
      RETURNING *
    `, [name, description || null, is_active === undefined ? true : is_active, categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory
};
