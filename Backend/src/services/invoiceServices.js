const Invoice = require('../config/models/invoiceModel');

const getInvoiceById = async (id) => {
  return await Invoice.findById(id).populate('order').populate("dealer.dealer");
};

const createInvoice = async (invoiceData) => {
  const newInvoice = new Invoice(invoiceData);
  return await newInvoice.save();
};

const updateInvoice = async (id, invoiceData) => {
  return await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
};

const deleteInvoice = async (id) => {
  return await Invoice.findByIdAndDelete(id);
};
const getAllInvoices = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;

  let query = {};

  if (filters.invoiceNumber) {
    query.invoiceNumber = { $regex: filters.invoiceNumber, $options: 'i' };
  }
  if (filters.dealerName) {
    query['dealer.dealerName'] = { $regex: filters.dealerName, $options: 'i' };
  }

  const invoices = await Invoice.find(query)
    .populate('order')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Invoice.countDocuments(query);

  return {
    invoices,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};


module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
