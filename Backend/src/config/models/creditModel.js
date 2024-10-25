const mongoose = require('mongoose');

const creditMemoSchema = new mongoose.Schema({
  creditMemoId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be a positive number'],
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['PENDING', 'REDEEMED'],
    default: 'PENDING',
    uppercase: true,
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true,
  },
  dealerName: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CreditMemo', creditMemoSchema);