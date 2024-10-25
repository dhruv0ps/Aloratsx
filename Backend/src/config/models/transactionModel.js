const mongoose = require("mongoose");
const addressSchema = require("./addressModel");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovedDealers",
      required: true,
    },
    dealerDetails: {
      name: String,
      email: String,
      company: String,
      designation: String,
      address: addressSchema
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    capturedAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
