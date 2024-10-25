const mongoose = require("mongoose");
const childSchema = require("./childModel");
const { Schema } = mongoose;

const productSchema = new Schema(
  {

    // name: { type: String, required: true, trim: true },
    // ID: { type: String, required: true, trim: true, unique: true },
    parentName: { type: String, required: true },
    children: [childSchema],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    // subCategory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'subCategory',
    //   required: true
    // },
    Description: {
      type: String,
      required: true,
    },
    // heroImage: {
    //   type: String,
    // },
    SKU: { type: String, required: true, unique: true }, 
  },
  {
    timestamps: true
  }
);
const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productSchema };
