const customercategoryService = require("../services/customercategoryService");

const createCategory = async (req, res) => {
    try {
      const customercategory = await customercategoryService.createCategory(req.body);
      res.status(201).json({ status: true, data: customercategory, err: {} });
    } catch (error) {
      res.status(400).json({ status: false, data: {}, err: error.message });
    }
  };
  
  // Get all categories
  const getCategories = async (req, res) => {
    try {
      const categories = await customercategoryService.getCategories(req.query);
      res.status(200).json({ status: true, data: categories, err: {} });
    } catch (error) {
      res.status(500).json({ status: false, data: {}, err: error.message });
    }
  };
  
  // Get category by ID
  const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
      const category = await customercategoryService.getCategoryById(id);
  
      if (!category) {
        return res.status(404).json({ status: false, message: 'Category not found' });
      }
  
      res.status(200).json({ status: true, data: category });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Failed to retrieve category' });
    }
  };
  
  // Update category
  const updateCategory = async (req, res) => {
    const { id } = req.params;
  
    try {
      const updatedCategory = await customercategoryService.updateCategory(id, req.body);
  
      if (!updatedCategory) {
        return res.status(404).json({ status: false, message: 'Category not found' });
      }
  
      res.status(200).json({ status: true, data: updatedCategory });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Failed to update category' });
    }
  };
  
  // Activate/Deactivate category
  const activateCategory = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body; // Assuming isActive is passed in the body
  
    try {
      const category = await customercategoryService.activateCategory(id, isActive);
  
      if (!category) {
        return res.status(404).json({ status: false, message: 'Category not found' });
      }
  
      res.status(200).json({ status: true, data: category, message: isActive ? 'Category activated' : 'Category deactivated' });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Failed to update category status' });
    }
  };
  
  module.exports = {
    createCategory,
    getCategories,
    getCategoryById,  // Add this to the exports
    updateCategory,
    activateCategory  // Add this to the exports
  };