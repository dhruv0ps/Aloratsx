const mongoose = require('mongoose');
const { Schema } = mongoose;

const embeddedProductSchema = new Schema({
    parentName: { type: String },
    childSKU: { type: String, required: true },
    childName: { type: String },
    quantity: { type: Number, required: true },
    description: { type: String },
    checked: { type: Boolean, default: false }
});

const packingSlipSchema = new Schema(
    {
        packingID: { type: String, required: true, unique: true },
        orderDetails: {
            dealerName: { type: String },
            purchaseOrderNumber: { type: String, required: true },
            products: [embeddedProductSchema],
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
        phase: {
            type: String,
            enum: ["Draft", "Finalized", "Completed"],
            default: "Draft"
        },
        receivedSign: { type: String },
    },
    { timestamps: true }
);

const PackingSlip = mongoose.model('PackingSlip', packingSlipSchema);
module.exports = PackingSlip;
