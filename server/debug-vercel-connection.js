const express = require("express")
const mongoose = require("mongoose")
const app = express()

// Add this endpoint to your api/index.js for debugging
app.get("/api/debug-mongo", async (req, res) => {
  try {
    console.log("🔍 Debug MongoDB Connection")
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI)
    console.log("MONGO_URI format:", process.env.MONGO_URI ? "Valid" : "Missing")

    if (process.env.MONGO_URI) {
      console.log("Connection string (masked):", process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@"))
    }

    console.log("Current mongoose state:", mongoose.connection.readyState)
    console.log("Mongoose states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting")

    // Try manual connection
    if (mongoose.connection.readyState === 0) {
      console.log("Attempting manual connection...")
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      })
      console.log("Manual connection successful!")
    }

    res.json({
      success: true,
      mongoUri: !!process.env.MONGO_URI,
      connectionState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      debug: "Check Vercel function logs for detailed info",
    })
  } catch (error) {
    console.error("Debug error:", error.message)
    res.status(500).json({
      success: false,
      error: error.message,
      mongoUri: !!process.env.MONGO_URI,
      connectionState: mongoose.connection.readyState,
    })
  }
})
