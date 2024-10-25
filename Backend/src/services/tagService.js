const Tag = require("../config/models/tagModel");

const createTag = async (data) => {
    const tag = new Tag({  name: data.name });
    return await tag.save();
};


const getAllTags = async () => {
    return await Tag.find();
};


const getTagById = async (id) => {
    return await Tag.findById(id);
};


const updateTag = async (id, updatedData) => {
    return await Tag.findByIdAndUpdate(id, updatedData, { new: true });
};


const deleteTag = async (id) => {
    return await Tag.findByIdAndDelete(id);
};

module.exports = {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag
};