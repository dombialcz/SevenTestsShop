const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number,
    customCoffee: {
      sugar: { type: Number, default: 0 },
      milk: { type: String, enum: ['none', 'regular', 'oat'], default: 'none' },
      coffee: { type: Number, default: 1 },
      chocolate: { type: Number, default: 0 }
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
