const inventoryServices = require('../services/inventoryService');
const damagedProductService = require('../services/damagedProductService');

class InventoryController {
    addStartingStock = async (req, res) => {
        try {
            const newInventory = await inventoryServices.addStartingStock(req.body,);
            return res.status(201).json({ status: true, data: newInventory, err: {} });
        } catch (error) {
            return res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    getInventoryById = async (req, res) => {
        try {
            const inventory = await inventoryServices.getInventoryById(req.params.id);
            return res.json({ status: true, data: inventory, err: {} });
        } catch (error) {
            return res.json({ status: false, data: {}, err: error.message });
        }
    }

    getAllInventories = async (req, res) => {
        try {
            const inventories = await inventoryServices.getAllInventories(req.body);
            return res.json({ status: true, data: inventories, err: {} });
        } catch (error) {
            return res.json({ status: false, data: {}, err: error.message });
        }
    }

    updateInventory = async (req, res) => {
        try {
            const updatedInventory = await inventoryServices.updateInventory(req.params.id, req.body);
            return res.json({ status: true, data: updatedInventory, err: {} });
        } catch (error) {
            return res.json({ status: false, data: {}, err: error.message });
        }
    }
    getInventoryByLocation = async (req, res) => {
        try {
            const inventory = await inventoryServices.getInventoryByLocation(req.params.id);
            res.json({ status: true, data: inventory, err: {} });
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    };

    moveInventory = async (req, res) => {
        try {
            const { sourceLocation, destinationLocation, items } = req.body;
            const result = await inventoryServices.moveInventory(sourceLocation, destinationLocation, items);
            res.json({ status: true, data: result, err: {} });
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    };

    //#region damaged prods

    addDamagedProduct = async (req, res) => {
        try {
            const damagedProduct = await damagedProductService.addDamagedProduct(req.body);
            res.status(201).json({ status: true, data: damagedProduct, err: {} });
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    };

    updateDamagedProduct = async (req, res) => {
        try {
            const damagedProduct = await damagedProductService.updateDamagedProduct(req.params.id, req.body,  );
            res.json({ status: true, data: damagedProduct, err: {} });
        } catch (error) {
            res.status(400).json({ status: false, data: {}, err: error.message });
        }
    };

    getAllDamagedProducts = async (req, res, next) => {
        try {
            const products = await damagedProductService.getAllDamagedProducts();
            return res.json({ status: true, data: products, err: {} });
        } catch (error) {
            console.log(error)
            return res.json({ status: false, data: {}, err: error.message });
        }
    };

}

module.exports = new InventoryController();