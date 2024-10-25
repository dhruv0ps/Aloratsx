
const mongoose = require('mongoose');
const addressSchema = require('./addressModel');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    emailID: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: addressSchema,
        required: true,
    },
    pickupGoogleMapLink: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED'],
        default: 'ACTIVE',
        uppercase: true,
    }
});
const Location = mongoose.model('Locations', LocationSchema);
module.exports = Location
