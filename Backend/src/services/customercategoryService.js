const CustomerCategory = require("../config/models/customerCategoryModel");

 const createCategory = async(categorydata) => {
    const customercategory = new CustomerCategory(categorydata);
    return customercategory.save();

 }
const getCategories = async() => {
    return CustomerCategory.find()
}
const getCategoryById = async (id) => {
    return await CustomerCategory.findById(id);
  };

const updateCategory = async (id, updateData) => {
    try {
        return await CustomerCategory.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        throw new Error('Failed to update category');
    }
};
const activateCategory = async (id, isActive) => {
    return await CustomerCategory.findByIdAndUpdate(id, { isActive }, { new: true });
  };

module.exports = {
    createCategory,
  getCategories,
  getCategoryById,  
  updateCategory,
  activateCategory 
}