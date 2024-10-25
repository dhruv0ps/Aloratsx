const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    commission: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED'],
        default: 'ACTIVE',
        uppercase: true,
    },
    linkedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Agent', agentSchema);
