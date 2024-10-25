const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, uppercase: true },
    category: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
    image: { type: String },
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE', uppercase: true, }
});
// category-name's compound key coz name may repeat across different categories
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('subCategory', subCategorySchema)
