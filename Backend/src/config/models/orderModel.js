const mongoose = require("mongoose");
const addressSchema = require("./addressModel");
const orderProductSchema = require("./orderProductModel");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedDealers", required: true },
    purchaseOrderNumber: { type: String, required: true, trim: true, unique: true },
    date: { type: Date },
    billTo: {
      companyName: { type: String, required: true },
      address: addressSchema,
    },
    shipTo: {
      companyName: { type: String },
      address: addressSchema,
    },
    products: [orderProductSchema],
    description: { type: String },
    totalBeforeTax: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    hst: { type: Number, default: 0 },
    qst: { type: Number, default: 0 },
    pst: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    phase: { type: String, enum: ["pending", "approved"], default: "pending" },
    status: {
      type: String,
      enum: ["APPROVED", "READY", "REJECT", "SHIPPED", "FULFILLED", "DELETED"],
      default: "APPROVED",
    },
    invoiceStatus: {
      type: String,
      enum: ["Pending", "Invoiced"],
      default: "Pending",
    },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    assignedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    assignedPackingSlip: { type: mongoose.Schema.Types.ObjectId, ref: "PackingSlip" },

  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
