const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderProductSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  childSKU: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

module.exports = orderProductSchema;
