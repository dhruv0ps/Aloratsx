const mongoose = require("mongoose");


const productTagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
}, { timestamps: true }); 

const Tag = mongoose.model("Tag", productTagSchema);


module.exports = Tag;
