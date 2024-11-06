const mongoose = require("mongoose");
const { Schema } = mongoose;

const inboundItemSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'NewProduct', required: true },
    child: {
        sku: { type: String, required: true },
        name: { type: String, required: true },
    },
   
    // parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NewProduct' },
    quantity: { type: Number, required: true },
});

const inboundSchema = new Schema({
    name: { type: String, unique: true, trim: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Locations' },
    items: [inboundItemSchema],

    status: {
        type: String,
        enum: ['DRAFT', 'COMPLETED', 'CANCELLED'],
        default: 'DRAFT'
    },
    referenceNumber : {type :String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const Inbound = mongoose.model("Inbound", inboundSchema);
module.exports = Inbound;