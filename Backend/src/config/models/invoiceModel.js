const mongoose = require('mongoose');
const { Schema } = mongoose;
const addressSchema = require("./addressModel")

const embeddedDealerSchema = new Schema({
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedDealers" },
  dealerName: { type: String, required: true },
  dealerAddress: addressSchema,
});

const embeddedProductSchema = new Schema({
  parentName: { type: String },
  childSKU: { type: String, required: true },
  childName: { type: String },
  quantity: { type: Number, required: true },
  description: { type: String },
  price: { type: Number, required: true },
});

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    dealer: embeddedDealerSchema,
    taxSlab: {
      name: {
        type: String,
        uppercase: true,
      },
      gst: { type: Number, default: 0 },
      hst: { type: Number, default: 0 },
      qst: { type: Number, default: 0 },
      pst: { type: Number, default: 0 },
    },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    purchaseOrderNumber: { type: String, required: true },
    products: [embeddedProductSchema],
    dueDate: { type: Date, required: true },
    type: {
      type: String,
      enum: ["Estimate", "Invoice"],
      required: true
    },
    totalAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    invoiceStatus: {
      type: String,
      enum: ["unpaid", "partially paid", "fully paid"],
      required: true
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
