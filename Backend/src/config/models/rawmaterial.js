const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema({
    material: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    measuringUnit: { type: String, required: true },
});

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

module.exports = RawMaterial;