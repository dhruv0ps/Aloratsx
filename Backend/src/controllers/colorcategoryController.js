const configServices = require('../services/colorcategoryService');

// Color Controller Functions
const addColor = async (req, res) => {
    try {
        const color = await configServices.addColor(req.body);
        return res.json({ status: true, data: color, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllColors = async (req, res) => {
    try {
        const colors = await configServices.getAllColors();
        return res.json({ status: true, data: colors, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const updateColor = async (req, res) => {
    try {
        const color = await configServices.updateColor(req.params.id, req.body);
        return res.json({ status: true, data: color, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const deleteColor = async (req, res) => {
    try {
        const color = await configServices.deleteColor(req.params.id);
        return res.json({ status: true, data: color, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

// Category Controller Functions
const addCategory = async (req, res) => {

    try {

        const imageUrl = req.file ? req.file.location : null;

        const category = await configServices.addCategory(req.body,imageUrl);
        return res.json({ status: true, data: category, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await configServices.getAllCategories();
        return res.json({ status: true, data: categories, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.location : null;

        // Update the category with the provided ID
        const category = await configServices.updateCategory(req.params.id, req.body, imageUrl);
        return res.json({ status: true, data: category, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await configServices.deleteCategory(req.params.id);
        return res.json({ status: true, data: category, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

// Subcategory
const addSubCategory = async (req, res) => {
    try {
        
        const subCategory = await configServices.addSubCategory(req.params.id, req.body);
        return res.json({ status: true, data: subCategory, err: {} });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await configServices.getAllSubCategories(req.params.id);
        return res.json({ status: true, data: subCategories, err: {} });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const updateSubCategory = async (req, res) => {
    try {
        const subCategory = await configServices.updateSubCategory(req.params.id, req.body);
        return res.json({ status: true, data: subCategory, err: {} });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, data: {}, err: error.message });
    }
};
// Tax slab 

const addTax = async (req, res) => {
    try {
        const color = await configServices.addTax(req.body);
        return res.json({ status: true, data: color, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllTaxSlabs = async (req, res) => {
    try {
        const colors = await configServices.getAllTaxSlabs();
        return res.json({ status: true, data: colors, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const updateTaxSlab = async (req, res) => {
    try {
        const color = await configServices.updateTaxSlab(req.params.id, req.body);
        return res.json({ status: true, data: color, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    addColor,
    getAllColors,
    updateColor,
    deleteColor,
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    getAllSubCategories,
    getAllTaxSlabs,
    addTax,
    updateTaxSlab
};
