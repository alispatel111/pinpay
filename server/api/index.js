const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

// Import routes
const productRoutes = require("../routes/productRoutes")
const orderRoutes = require("../routes/orderRoutes")

// Enhanced CORS configuration for Vercel deployment
app.use(
  cors({
    origin: "*", // Allow all origins for now, restrict later if needed
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Handle preflight requests
app.options("*", cors())

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Pin & Pay Backend is running",
    timestamp: new Date().toISOString(),
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
  })
})

// Routes
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
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

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not set")
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== "production") {
      process.exit(1)
    }
  }
}

// Initialize database connection
connectDB()

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected")
})

const PORT = process.env.PORT || 5000

// Only listen if not in Vercel environment
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

// Export for Vercel
module.exports = app
