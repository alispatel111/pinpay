const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create order
router.post('/checkout', async (req, res) => {
  const { items, totalAmount } = req.body;
  const newOrder = new Order({ items, totalAmount, paid: true });
  await newOrder.save();

  const invoicePath = path.join(__dirname, `../public/invoices/invoice_${newOrder._id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(invoicePath));

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.text(`Order ID: ${newOrder._id}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.text(`Total Amount: ₹${totalAmount}\n\n`);
  doc.text('Items:\n');

  newOrder.items.forEach((item) => {
    doc.text(`${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`);
  });

  doc.end();

  res.json({
    message: 'Order placed successfully',
    invoiceUrl: `/invoices/invoice_${newOrder._id}.pdf`
  });
});

module.exports = router;
