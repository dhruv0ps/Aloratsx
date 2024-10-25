const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['ADMIN', 'Associate1', 'Associate2'],
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);