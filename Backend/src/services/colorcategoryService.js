const Color = require('../config/models/colorModel');
const Category = require('../config/models/categoryModel');
const subcategory = require('../config/models/subcategoryModel');
const TaxSlab = require("../config/models/taxSlabModel")

const configServices = {
    // Color services
    addColor: async (data) => {
        try {
            const newColor = await Color.create(data);
            return newColor;
        } catch (error) {
            throw error;
        }
    },

    getAllColors: async () => {
        try {
            const colors = await Color.find();
            return colors;
        } catch (error) {
            throw error;
        }
    },

    updateColor: async (id, data) => {
        try {
            const updatedColor = await Color.findByIdAndUpdate(id, data, { new: true });
            return updatedColor;
        } catch (error) {
            throw error;
        }
    },

    deleteColor: async (id) => {
        try {
            const deletedColor = await Color.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
            return deletedColor;
        } catch (error) {
            throw error;
        }
    },

    // Category services
    addCategory: async (data, imagePath) => {
        try {
            data.image = imagePath; // Save image path
            const newCategory = await Category.create(data);
            return newCategory;
        } catch (error) {
            throw error;
        }
    },

    getAllCategories: async () => {
        try {
            const categories = await Category.find();
            return categories;
        } catch (error) {
            throw error;
        }
    },

    updateCategory: async (id, data, imagePath) => {
        try {
            if (imagePath) data.image = imagePath;
            const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });
            return updatedCategory;
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const deletedCategory = await Category.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
            return deletedCategory;
        } catch (error) {
            throw error;
        }
    },

    //subcategory
    addSubCategory: async (id, data, imagePath) => {
        try {
            data.category = id
            const newSubCategory = await subcategory.create(data);
            return newSubCategory;
        } catch (error) {
            throw error;
        }
    },

    getAllSubCategories: async (id) => {
        try {
            const subCategories = await subcategory.find({ category: id }).populate('category');
            return subCategories;
        } catch (error) {
            throw error;
        }
    },

    updateSubCategory: async (id, data, imagePath) => {
        try {
            // if (imagePath) data.image = imagePath;
            const updatedSubCategory = await subcategory.findByIdAndUpdate(id, data, { new: true }).populate('category');
            return updatedSubCategory;
        } catch (error) {
            throw error;
        }
    },


    // taxes

    addTax: async (data) => {
        try {
            return await TaxSlab.create(data);
        } catch (error) {
            throw error;
        }
    },

    getAllTaxSlabs: async () => {
        try {
            return await TaxSlab.find();
        } catch (error) {
            throw error;
        }
    },

    updateTaxSlab: async (id, data) => {
        try {
            return await TaxSlab.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw error;
        }
    },
};

module.exports = configServices;
