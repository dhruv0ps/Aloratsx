const tagService = require("../services/tagService");


const createTag = async(req,res) => {
    try{
      const tag = await tagService.createTag(req.body);
      res.status(201).json({ status: true, data: tag, err: {} })

    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
}
const getAllTags = async (req, res) => {
    try {
        const tags = await tagService.getAllTags();
        res.status(200).json({ status: true, data: tags, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

// Get a tag by ID
const getTagById = async (req, res) => {
    try {
        const tag = await tagService.getTagById(req.params.id);
        if (!tag) {
            return res.status(404).json({ status: false, data: {}, err: "Tag not found." });
        }
        res.status(200).json({ status: true, data: tag, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

// Update a tag
const updateTag = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ status: false, data: {}, err: "Tag name is required." });
        }

        const tag = await tagService.updateTag(req.params.id, req.body);
        if (!tag) {
            return res.status(404).json({ status: false, data: {}, err: "Tag not found." });
        }
        res.status(200).json({ status: true, data: tag, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

// Delete a tag
const deleteTag = async (req, res) => {
    try {
        const deletedTag = await tagService.deleteTag(req.params.id);
        if (!deletedTag) {
            return res.status(404).json({ status: false, data: {}, err: "Tag not found." });
        }
        res.status(200).json({ status: true, data: {}, err: {}, message: "Tag successfully deleted." });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag,
};