const DealerList = require("../config/models/dealerList");

const dealerService = {
    createDealer: async (data) => {
        try {
            const newDealer = await DealerList.create(data);
            return newDealer;
        } catch (error) {
            throw error;
        }
    },
    getAllDealers: async () => {
        try {
            return await DealerList.find().populate("province");
        } catch (error) {
            throw error;
        }
    },

    deleteDealer: async (id) => {
        try {
            const deletedDealer = await DealerList.findByIdAndDelete(id);
            return deletedDealer;
        } catch (error) {
            throw error;
        }
    },

    getDealerById: async (id) => {
        try {
            const dealer = await DealerList.findById(id).populate("province");
            if (!dealer) {
                throw new Error('Dealer not found');
            }
            return dealer;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = dealerService;
