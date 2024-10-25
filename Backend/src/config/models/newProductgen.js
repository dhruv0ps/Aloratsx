const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema({
    material: { type: String, required: true },
    materialId: { type: String, },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
});

const ChildSchema = new mongoose.Schema({
    SKU: { type: String, required: true },
    name: { type: String, required: true },
    selling_price: { type: Number, required: true },
    cost_price: { type: Number, required: true },
    weight: { 
        value: { type: Number, required: true }, 
        unit: { type: String, required: true } 
    },
    status: { type: String, required: true },
    imageUrl: { type: String },
    stock: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    firmness: { type: String },
    description: { type: String, required: true },
    tags: [{ _id: String, name: String }],
    rawMaterials: [RawMaterialSchema],
    product_size: { L: { type: Number }, W: { type: Number }, H: { type: Number } },
});

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: [{ type: String,  }],
    ID: { type: String, required: true },
    Description: { type: String, required: true },
    heroImageUrl: { type: String },
    children: [ChildSchema],
});

module.exports = mongoose.model('NewProduct', ProductSchema);
