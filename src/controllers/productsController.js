const pool = require("../config/database");

async function getProducts(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, category_id, name, description,
             price, stock_quantity, sku, is_active, created_at
      FROM products
      ORDER BY id DESC
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
      message: "Failed to retrieve products"
    });
  }
}

async function getProductById(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product"
    });
  }
}

async function createProduct(req, res) {
  try {
    const {
      category_id,
      name,
      description,
      price,
      stock_quantity = 0,
      sku
    } = req.body;

    if (!category_id || !name || price === undefined || !sku) {
      return res.status(400).json({
        success: false,
        message: "category_id, name, price and sku are required"
      });
    }

    if (Number(price) <= 0 || Number(stock_quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive and stock cannot be negative"
      });
    }

    const result = await pool.query(`
      INSERT INTO products
        (category_id, name, description, price, stock_quantity, sku)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [category_id, name, description || null, price, stock_quantity, sku]);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Category does not exist"
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const {
      category_id, name, description,
      price, stock_quantity, sku, is_active
    } = req.body;

    if (!category_id || !name || price === undefined || !sku) {
      return res.status(400).json({
        success: false,
        message: "category_id, name, price and sku are required"
      });
    }

    if (Number(price) <= 0 || Number(stock_quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive and stock cannot be negative"
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET category_id = $1,
          name = $2,
          description = $3,
          price = $4,
          stock_quantity = $5,
          sku = $6,
          is_active = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [category_id, name, description || null, price,
        stock_quantity, sku, is_active === undefined ? true : is_active, productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
}

async function deactivateProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [productId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate product"
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct
};
