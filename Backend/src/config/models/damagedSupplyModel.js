const mongoose = require("mongoose");
const { Schema } = mongoose;

const damagedProdSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'NewProduct', required: true },
    child: { type: String, required: true, trim: true }, //sku
    quantity: { type: Number, required: true },
    comments: { type: String, required: true },
    orderid: { type: String },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
    invLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Locations' },
    images: [{ type: String }],
}, {
    timestamps: true
});

const DamagedSupplyModel = mongoose.model("damagedProducts", damagedProdSchema);
module.exports = DamagedSupplyModel;
