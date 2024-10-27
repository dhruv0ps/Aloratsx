const customercategoryService = require("../services/customercategoryService");


const createCategory = async(req,res) => {
 try{
   const customercategory = await customercategoryService.createCategory(req.body);
   res.status(201).json({ status: true, data: customercategory, err: {} });
 }
 catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
}
}
const getCategories = async (req, res) => {
    try {
        const categories = await customercategoryService.getCategories(req.query);
        res.status(200).json({ status: true, data: categories, err: {} });
    } catch (error) {
        res.status(500).json({ status: false, data: {}, err: error.message });
    }
};

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


module.exports ={
    createCategory,
    getCategories,
    updateCategory
}