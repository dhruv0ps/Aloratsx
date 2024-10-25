const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  hexCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DELETED'],
    default: 'ACTIVE',
    uppercase: true,
  }
});

module.exports = mongoose.model('Color', colorSchema);
