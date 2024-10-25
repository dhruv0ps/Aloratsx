const RawMaterial = require("../config/models/rawmaterial");

const createMaterial = async (data, imagePath) => {
    data.image = imagePath;
    console.log(imagePath)
    const rawMaterial = new RawMaterial(data);
    return await rawMaterial.save();
};

const getAllMaterials = async (filter = {}) => {
    return await RawMaterial.find(filter);
};

const getMaterialById = async (id) => {
    return await RawMaterial.findById(id);
};

const updateMaterial = async (id, updateData) => {
    return await RawMaterial.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteMaterial = async (id) => {
    return await RawMaterial.findByIdAndDelete(id, { status: 'DELETED' }, { new: true });
};

module.exports = {
    createMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
};