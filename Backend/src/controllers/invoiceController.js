const invoiceService = require('../services/invoiceServices');

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (invoice) {
      res.json({ status: true, data: invoice, err: {} });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ status: true, data: invoice, err: {} });
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const updatedInvoice = await invoiceService.updateInvoice(req.params.id, req.body);
    if (updatedInvoice) {
      res.json({ status: true, data: updatedInvoice, err: {} });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};
const getAllInvoices = async (req, res) => {
  try {
    const { page, limit, filters } = req.body;
    // const filters = { category, operation, detail };
    const invoices = await invoiceService.getAllInvoices(parseInt(page), parseInt(limit), filters);
    res.status(200).json({ status: true, data: invoices, err: {} });
  } catch (error) {
    res.status(500).json({ status: false, data: {}, err: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await invoiceService.deleteInvoice(req.params.id);
    if (deletedInvoice) {
      res.json({ status: true, data: deletedInvoice, err: {} });
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ status: false, data: {}, err: error.message });
  }
};

module.exports = {
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getAllInvoices
};
