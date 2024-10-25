const mongoose = require('mongoose');

const taxSlabSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true
    },
    gst: { type: Number, default: 0 },
    hst: { type: Number, default: 0 },
    qst: { type: Number, default: 0 },
    pst: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED'],
        default: 'ACTIVE',
        uppercase: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('taxslabs', taxSlabSchema);
