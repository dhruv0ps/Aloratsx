const Location = require('../config/models/locationModel');

const locationServices = {
    addLocation: async (data) => {
        try {
            // console.log(data)
            const newLocation = await Location.create(data);
            return newLocation;
        } catch (error) {
            console.log(error)
            throw error;
        }
    },

    getAllLocations: async () => {
        try {
            const locations = await Location.find();
            return locations;
        } catch (error) {
            throw error;
        }
    },

    getLocationById: async (id) => {
        try {
            return await Location.findById(id);
        } catch (error) {
            throw error;
        }
    },

    updateLocation: async (id, data) => {
        try {
            const updatedLocation = await Location.findByIdAndUpdate(id, data, { new: true });
            return updatedLocation;
        } catch (error) {
            throw error;
        }
    },

    deleteLocation: async (id) => {
        try {
            const deletedLocation = await Location.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true });
            return deletedLocation;
        } catch (error) {
            throw error;
        }
    },
}

module.exports = locationServices;
