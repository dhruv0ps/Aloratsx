const CustomerCategory = require("../config/models/customerCategoryModel");

 const createCategory = async(categorydata) => {
    const customercategory = new CustomerCategory(categorydata);
    return customercategory.save();

 }
const getCategories = async() => {
    return CustomerCategory.find()
}

const updateCategory = async (id, updateData) => {
    try {
        return await CustomerCategory.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        throw new Error('Failed to update category');
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory
}