const mongoose = require("mongoose")
require("dotenv").config()

// Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  sku: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Product = mongoose.model("Product", productSchema)

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple iPhone with A17 Pro chip and titanium design",
    price: 134900,
    category: "Electronics",
    sku: "IPH15PRO001",
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone with AI features and 200MP camera",
    price: 89999,
    category: "Electronics",
    sku: "SAM24001",
  },
  {
    name: "MacBook Air M3",
    description: "Ultra-thin laptop with M3 chip, 13-inch Liquid Retina display",
    price: 114900,
    category: "Electronics",
    sku: "MBA13M3001",
  },
  {
    name: "AirPods Pro (2nd Gen)",
    description: "Wireless earbuds with active noise cancellation and spatial audio",
    price: 24900,
    category: "Electronics",
    sku: "APP2GEN001",
  },
  {
    name: "Coca Cola 500ml",
    description: "Refreshing soft drink, ice cold and fizzy",
    price: 40,
    category: "Beverages",
    sku: "COKE500001",
  },
]

async function addProductsToCorrectDB() {
  try {
    console.log("🔄 Connecting to pin-and-pay database...")

    // Make sure to use the pin-and-pay database
    const mongoUri = process.env.MONGO_URI.replace(/\/\?/, "/pin-and-pay?")
    console.log("📝 Using database: pin-and-pay")

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")
    console.log("📊 Database:", mongoose.connection.name)

    // Clear existing products
    await Product.deleteMany({})
    console.log("🗑️ Cleared existing products")

    // Add sample products
    const products = await Product.insertMany(sampleProducts)
    console.log(`✅ Added ${products.length} sample products to pin-and-pay database`)

    console.log("\n📦 Products added with URLs:")
    products.forEach((product) => {
      console.log(`📦 ${product.name}`)
      console.log(`   💰 Price: ₹${product.price}`)
      console.log(`   🆔 ID: ${product._id}`)
      console.log(`   🔗 URL: https://pinpay-red.vercel.app/product/${product._id}`)
      console.log("")
    })

    console.log("🎉 Database setup complete!")
    await mongoose.connection.close()
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

addProductsToCorrectDB()
