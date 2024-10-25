const mongoose = require("mongoose")
const addressSchema = new mongoose.Schema({
    unit: { type: String },
    buzz: { type: String },
    address: { type: String, required: true },
    longitude: { type: String },
    latitude: { type: String},
}, { id: false })

module.exports = addressSchema