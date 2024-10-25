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

module.exports ={
    createCategory,
    getCategories
}