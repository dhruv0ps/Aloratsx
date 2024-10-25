const locationServices = require('../services/locationService');

const addLocation = async (req, res) => {
    try {
        const location = await locationServices.addLocation(req.body);
        return res.json({ status: true, data: location, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllLocations = async (req, res) => {
    try {
        const locations = await locationServices.getAllLocations();
        return res.json({ status: true, data: locations, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};
const getLocationById = async (req, res) => {
    try {
        const location = await locationServices.getLocationById(req.params.id);
        return res.json({ status: true, data: location, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};
const updateLocation = async (req, res) => {
    try {
        const location = await locationServices.updateLocation(req.params.id, req.body);
        return res.json({ status: true, data: location, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const deleteLocation = async (req, res) => {
    try {
        const location = await locationServices.deleteLocation(req.params.id);
        return res.json({ status: true, data: location, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    addLocation,
    getAllLocations,
    updateLocation,
    deleteLocation,
    getLocationById
};
