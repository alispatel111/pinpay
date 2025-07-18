const express = require("express")
const router = express.Router()
const Order = require("../models/Order")

// Create order - simplified for Vercel deployment
router.post("/checkout", async (req, res) => {
  try {
    const { items, totalAmount } = req.body

    console.log("Creating order:", { itemCount: items?.length, totalAmount })

    const newOrder = new Order({
      items,
      totalAmount,
      paid: true,
    })

    await newOrder.save()
    console.log("Order created:", newOrder._id)

    // For now, just return success without PDF generation
    // PDF generation can be added later with proper file storage
    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      // invoiceUrl: `/invoices/invoice_${newOrder._id}.pdf` // Disabled for now
    })
  } catch (error) {
    console.error("Order creation error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    })
  }
})

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Order fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    })
  }
})

module.exports = router
