const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")

const app = express()

// Enhanced CORS configuration for Vercel deployment
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://pin-and-pay.vercel.app", /\.vercel\.app$/]
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.static("public"))

// Create public/invoices directory if it doesn't exist
const fs = require("fs")
const invoicesDir = path.join(__dirname, "public/invoices")
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true })
}

// Serve static files from tools directory
app.use("/tools", express.static(path.join(__dirname, "tools")))

// Routes
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 NFC Writer available at: http://localhost:${PORT}/tools/nfc-writer.html`)
})

// For Vercel serverless deployment
module.exports = app
