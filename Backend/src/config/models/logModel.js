const mongoose = require('mongoose');
const { Schema } = mongoose;

const logSchema = new Schema(
    {
        operation: {
            type: String,
            required: true,
        },
        details: {
            type: Schema.Types.Mixed,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        // createdBy: {  to be added after authentication.
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true,
        // },
    },
    {
        timestamps: true,
    }
);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;