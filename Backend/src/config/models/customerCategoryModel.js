const mongoose = require("mongoose");

const customerCategorySchema = new mongoose.Schema({
    customercategoryId: { type: String, required: true },
    customercategoryName: { type: String, required: true },
    customercategoryDescription: { type: String, required: true },
    isActive: { type: Boolean, default: true }  
});

module.exports = mongoose.model('CustomerCategory', customerCategorySchema);
