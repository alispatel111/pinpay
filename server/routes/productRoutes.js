const express = require("express")
const router = express.Router()
const Product = require("../models/productModel")

// Get product by ID (for QR/NFC scanning)
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching product with ID:", req.params.id)

    const product = await Product.findById(req.params.id)
    if (!product) {
      console.log("Product not found:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    console.log("Product found:", product.name)
    res.json({
      success: true,
      data: product,
    })
  } catch (err) {
    console.error("Product fetch error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    })
  }
})

// Get all products (for admin/management)
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all products")
    const products = await Product.find({})
    console.log(`Found ${products.length} products`)

    res.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (err) {
    console.error("Products fetch error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    })
  }
})

// Create new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, sku } = req.body

    console.log("Creating product:", { name, price, category })

    const product = new Product({
      name,
      description,
      price,
      category,
      sku,
    })

    await product.save()
    console.log("Product created:", product._id)

    res.status(201).json({
      success: true,
      data: product,
      nfcUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/product/${product._id}`,
    })
  } catch (err) {
    console.error("Product creation error:", err)
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: err.message,
    })
  }
})

module.exports = router
