const mongoose = require("mongoose")
const addressSchema = require("./addressModel")
const dealerlist = new mongoose.Schema({
    username: { type: String, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    address: addressSchema,
    province: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('dealerList', dealerlist);