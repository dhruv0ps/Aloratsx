const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    unit: String,
    street: String,
    buzzCode: String,
    city: String,
    province: String,
    postalCode: String,
    isDefault: { type: Boolean, default: true }
});

const customerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    cell: { type: String },
    emailId: { type: String, required: true },
    emailId2: { type: String },
    businessName: { type: String },
    customerCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCategory' },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
