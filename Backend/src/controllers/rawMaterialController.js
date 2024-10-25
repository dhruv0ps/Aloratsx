const rawMaterialService = require('../services/rawMaterialService');


const createRawMaterial = async (req, res) => {
    try {
       
        const rawMaterial = await rawMaterialService.createMaterial(req.body, req.file.path);
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
        const updatedRawMaterial = await rawMaterialService.updateMaterial(req.params.id, req.body);
        res.json({ status: true, data: updatedRawMaterial, err: {} });
    } catch (error) {
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
