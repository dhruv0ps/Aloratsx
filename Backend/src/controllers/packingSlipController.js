const packingSlipService = require('../services/packingSlipServices');

const getPackingSlipById = async (req, res) => {
  try {
    const packingSlip = await packingSlipService.getPackingSlipById(req.params.id);
    if (packingSlip) {
      res.json({ status: true, data: packingSlip, err: {} });
    } else {
      res.status(404).json({ message: 'Packing Slip not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

const getAllPackingSlips = async (req, res) => {
  try {
    const { page, limit, filters } = req.body;
    // const filters = { category, operation, detail };
    const packingSlips = await packingSlipService.getAllPackingSlips(parseInt(page), parseInt(limit), filters);
    res.status(200).json({ status: true, data: packingSlips, err: {} });
  } catch (error) {
    res.status(500).json({ status: false, data: {}, err: error.message });
  }
};

const createPackingSlip = async (req, res) => {
  try {
    const packingSlip = await packingSlipService.createPackingSlip(req.body);
    res.status(201).json({ status: true, data: packingSlip, err: {} });
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

const updatePackingSlip = async (req, res) => {
  try {
    const updatedPackingSlip = await packingSlipService.updatePackingSlip(req.params.id, req.body);
    if (updatedPackingSlip) {
      res.json({ status: true, data: updatedPackingSlip, err: {} });
    } else {
      res.status(404).json({ message: 'Packing Slip not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

const deletePackingSlip = async (req, res) => {
  try {
    const deletedPackingSlip = await packingSlipService.deletePackingSlip(req.params.id);
    if (deletedPackingSlip) {
      res.json({ status: true, data: deletedPackingSlip, err: {} });
    } else {
      res.status(404).json({ message: 'Packing Slip not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

module.exports = {
  getPackingSlipById,
  createPackingSlip,
  updatePackingSlip,
  deletePackingSlip,
  getAllPackingSlips
};
