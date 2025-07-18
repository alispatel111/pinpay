const express = require("express")
const router = express.Router()
const Product = require("../models/productModel")

// Get product by ID (for QR/NFC scanning)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (err) {
    console.error("Product fetch error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Get all products (for admin/management)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
    res.json({
      success: true,
      data: products,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Create new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, sku } = req.body

    const product = new Product({
      name,
      description,
      price,
      category,
      sku,
    })

    await product.save()

    res.status(201).json({
      success: true,
      data: product,
      nfcUrl: `http://localhost:5173/product/${product._id}`,
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
    })
  }
})

module.exports = router
