const mongoose = require('mongoose');
const addressSchema = require("./addressModel")

const approvedDealerSchema = new mongoose.Schema({
    contactPersonName: {
        type: String,
        required: true,
        trim: true
    },
    contactPersonCell: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    contactPersonEmail: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    address: addressSchema,
    province: {
        type: mongoose.Schema.Types.ObjectId, ref: 'taxslabs',
        required: true
    },
    priceDiscount: {
        type: String,
        required: true,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    creditDueDays: {
        type: String,
        required: true,
        trim: true
    },
    creditDueAmount: {
        type: String,
        required: true,
        trim: true
    },
    totalOpenBalance: {
        type: Number,
        required: true
    },
    totalBalance: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED'],
        default: 'ACTIVE',
        uppercase: true,
    },
    token: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const ApprovedDealer = mongoose.model('ApprovedDealers', approvedDealerSchema);

module.exports = { ApprovedDealer, approvedDealerSchema };
