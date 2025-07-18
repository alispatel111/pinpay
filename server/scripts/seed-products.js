// Run this script to add real products to your database
const mongoose = require("mongoose")
const Product = require("../models/productModel")
require("dotenv").config()

// Connect to MongoDB using the environment variable
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected for seeding"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple iPhone with A17 Pro chip",
    price: 134900,
    category: "Electronics",
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone with AI features",
    price: 89999,
    category: "Electronics",
  },
  {
    name: "MacBook Air M3",
    description: "Ultra-thin laptop with M3 chip",
    price: 114900,
    category: "Electronics",
  },
  {
    name: "AirPods Pro",
    description: "Wireless earbuds with active noise cancellation",
    price: 24900,
    category: "Electronics",
  },
  {
    name: "Coca Cola",
    description: "Refreshing soft drink 500ml",
    price: 40,
    category: "Beverages",
  },
]

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({})
    console.log("🗑️ Cleared existing products")

    // Insert sample products
    const products = await Product.insertMany(sampleProducts)
    console.log("✅ Sample products added successfully!")

    console.log("\n📦 Products with NFC URLs:")
    products.forEach((product) => {
      console.log(`📦 ${product.name} - ID: ${product._id}`)
      console.log(`   💰 Price: ₹${product.price}`)
      console.log(`   🔗 NFC URL: http://localhost:5173/product/${product._id}`)
      console.log("")
    })

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding products:", error)
    process.exit(1)
  }
}

seedProducts()
