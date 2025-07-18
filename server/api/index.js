const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Enhanced CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.options("*", cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Basic health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Pin & Pay Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
  })
})

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Pin & Pay API is running",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongoState: mongoose.connection.readyState,
    mongoUri: process.env.MONGO_URI ? "configured" : "missing",
    host: mongoose.connection.host || "not connected",
    database: mongoose.connection.name || "not connected",
  })
})

// DEBUG ENDPOINT - Add this for debugging
app.get("/api/debug-mongo", async (req, res) => {
  try {
    console.log("🔍 Debug MongoDB Connection")
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI)

    if (process.env.MONGO_URI) {
      console.log("Connection string (masked):", process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@"))
    }

    console.log("Current mongoose state:", mongoose.connection.readyState)
    console.log("Mongoose states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting")

    // Try manual connection if disconnected
    if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
      console.log("Attempting manual connection...")
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
      })
      console.log("Manual connection successful!")
    }

    res.json({
      success: true,
      mongoUri: !!process.env.MONGO_URI,
      connectionState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      connectionString: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@") : "missing",
      debug: "Check Vercel function logs for detailed info",
    })
  } catch (error) {
    console.error("Debug error:", error.message)
    res.status(500).json({
      success: false,
      error: error.message,
      mongoUri: !!process.env.MONGO_URI,
      connectionState: mongoose.connection.readyState,
      connectionString: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@") : "missing",
    })
  }
})

// Schemas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  sku: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Product = mongoose.model("Product", productSchema)

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const Order = mongoose.model("Order", orderSchema)

// Enhanced MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI environment variable is not set")
      return
    }

    console.log("🔄 Connecting to MongoDB...")
    console.log("MongoDB URI configured:", !!process.env.MONGO_URI)
    console.log("Connection string (masked):", process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@"))

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    console.error("Full error:", error)
  }
}

// Initialize database connection
connectDB()

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected - attempting to reconnect...")
  setTimeout(connectDB, 5000)
})

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully")
})

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnected")
})

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected",
      mongoState: mongoose.connection.readyState,
      hint: "Please check MongoDB connection string and network access",
    })
  }
  next()
}

// Product routes
app.get("/api/products", checkDBConnection, async (req, res) => {
  try {
    console.log("📦 Fetching all products")
    const products = await Product.find({}).maxTimeMS(10000)
    console.log(`✅ Found ${products.length} products`)

    res.json({
      success: true,
      data: products,
      count: products.length,
    })
  } catch (err) {
    console.error("❌ Products fetch error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    })
  }
})

app.get("/api/products/:id", checkDBConnection, async (req, res) => {
  try {
    console.log("🔍 Fetching product with ID:", req.params.id)
    const product = await Product.findById(req.params.id).maxTimeMS(10000)

    if (!product) {
      console.log("❌ Product not found:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    console.log("✅ Product found:", product.name)
    res.json({
      success: true,
      data: product,
    })
  } catch (err) {
    console.error("❌ Product fetch error:", err)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    })
  }
})

// Create product
app.post("/api/products", checkDBConnection, async (req, res) => {
  try {
    const { name, description, price, category, sku } = req.body
    console.log("➕ Creating product:", { name, price, category })

    const product = new Product({
      name,
      description,
      price,
      category,
      sku,
    })

    await product.save()
    console.log("✅ Product created:", product._id)

    res.status(201).json({
      success: true,
      data: product,
    })
  } catch (err) {
    console.error("❌ Product creation error:", err)
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: err.message,
    })
  }
})

// Order routes
app.post("/api/orders/checkout", checkDBConnection, async (req, res) => {
  try {
    const { items, totalAmount } = req.body
    console.log("🛒 Creating order:", { itemCount: items?.length, totalAmount })

    const newOrder = new Order({
      items,
      totalAmount,
      paid: true,
    })

    await newOrder.save()
    console.log("✅ Order created:", newOrder._id)

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    })
  } catch (error) {
    console.error("❌ Order creation error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

module.exports = app
