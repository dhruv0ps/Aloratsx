const mongoose = require("mongoose")
const { Schema } = mongoose;

// Define sizeSchema
const sizeSchema = new Schema({
    L: { type: Number },
    W: { type: Number },
    H: { type: Number }
}, { _id: false });


const ImageSchema = new mongoose.Schema({
    filename: String,
    path: String
}, { _id: false });

// Define childSchema
const childSchema = new Schema({
    SKU: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    // color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
    selling_price: { type: Number, required: true },
    firmness: { type: String, required: true },
    cost_price: { type: Number, default: 0 },
    product_size: { type: sizeSchema },
    weight: {
        value: { type: Number },
        unit: { type: String, enum: ['lb', 'kg'], default: 'lb' }
    },
    description: {
        type: String,
        required: true,
    },
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
        required: true
    },
    isActive: { type: Boolean, default: true },
    rawMaterials: [{ material: String, quantity: Number, unit: String }],
    tags: [{ type: String }],
    // image: { type: ImageSchema },
    stock: { type: Number, default: 0 }
});

module.exports = childSchema