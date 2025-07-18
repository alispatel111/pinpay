const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
