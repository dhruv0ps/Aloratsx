const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define InventorySchema
const inventorySchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    child: { type: String, required: true, trim: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Locations', required: true },
    quantity: { type: Number, required: true },
    booked: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    status: {
        type: String,
        enum: [
            'IN STOCK',
            'LOW STOCK',
            'VERY LOW IN STOCK',
            'OUT OF STOCK',
            'DISCONTINUED'
        ],
        default: "IN STOCK",
    },
}, {
    timestamps: true
});

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
