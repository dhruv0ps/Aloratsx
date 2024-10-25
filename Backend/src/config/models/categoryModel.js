const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
    },
    description: {
        type: String,
        required: true,
        uppercase: true,
    },
    image: {
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

module.exports = mongoose.model('Category', categorySchema)
