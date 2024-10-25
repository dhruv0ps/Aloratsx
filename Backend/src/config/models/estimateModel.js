const mongoose = require("mongoose");
const { Schema } = mongoose;

// Function to format the number to two decimal places
const formatToTwoDecimalPlaces = (value) => {
  if (typeof value === 'number') {
    return parseFloat(value.toFixed(2));
  }
  return value;
};

const estimateSchema = new Schema(
  {
    dealer: {
      type: mongoose.Types.ObjectId,
      ref: "ApprovedDealers",
      required: true,
    },
    taxSlab: {
      type: mongoose.Types.ObjectId,
      ref: "taxslabs",
      required: true,
    },
    orders: [{
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
    }],
    dueDate: {
      type: Date,
      required: true,
    },
    estimateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type:{
      type:String,
      required:true
    },
    totalAmount: {
      type: Number,
      required: true,
      set: formatToTwoDecimalPlaces,
    },
    dueAmount: {
      type: Number,
      required: true,
      set: formatToTwoDecimalPlaces,
    },
    estimateStatus: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Estimate = mongoose.model("Estimate", estimateSchema);
module.exports = Estimate;