const rawMaterialService = require('../services/rawMaterialService');


const createRawMaterial = async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.location : null;
        const rawMaterial = await rawMaterialService.createMaterial(req.body, imageUrl);
        res.status(201).json({ status: true, data: rawMaterial, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};


const getRawMaterials = async (req, res) => {
    try {
        const rawMaterials = await rawMaterialService.getAllMaterials(req.query);
        res.json({ status: true, data: rawMaterials, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};


const getRawMaterialById = async (req, res) => {
    try {
        const rawMaterial = await rawMaterialService.getMaterialById(req.params.id);
        if (rawMaterial) {
            res.json({ status: true, data: rawMaterial, err: {} });
        } else {
            res.status(404).json({ status: false, data: {}, err: 'Raw Material not found' });
        }
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};


const updateRawMaterialById = async (req, res) => {
    try {
       
        const rawMaterialId = req.params.id;
        const updatedData = { ...req.body };

     
        if (req.file && req.file.location) {
         
            updatedData.image = req.file.location;
        }

       
        const updatedRawMaterial = await rawMaterialService.updateMaterial(rawMaterialId, updatedData);

      
        res.json({ status: true, data: updatedRawMaterial, err: {} });
    } catch (error) {
        // Handle errors
        console.error("Error updating raw material:", error);
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};



const deleteRawMaterialById = async (req, res) => {
    try {
        const deletedRawMaterial = await rawMaterialService.deleteMaterial(req.params.id);
        res.json({ status: true, data: deletedRawMaterial, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    createRawMaterial,
    getRawMaterials,
    getRawMaterialById,
    updateRawMaterialById,
    deleteRawMaterialById,
};
