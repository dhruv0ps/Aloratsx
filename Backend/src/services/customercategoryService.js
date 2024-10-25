const CustomerCategory = require("../config/models/customerCategoryModel");

 const createCategory = async(categorydata) => {
    const customercategory = new CustomerCategory(categorydata);
    return customercategory.save();

 }
const getCategories = async() => {
    return CustomerCategory.find()
}
module.exports = {
    createCategory,
    getCategories
}