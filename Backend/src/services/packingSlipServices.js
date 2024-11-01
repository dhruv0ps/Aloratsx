const { default: mongoose } = require("mongoose");
const Order = require('../config/models/orderModel');
const Invoice = require('../config/models/invoiceModel');
const PackingSlip = mongoose.model("PackingSlip")

const getPackingSlipById = async (id) => {
  return await PackingSlip.findById(id).populate('order');
};
const generateInvoiceId = async () => {
  const highestInvoice = await Invoice.findOne({ invoiceNumber: { $regex: /^ALINV/ } }).sort({ invoiceNumber: -1 });

  let invNumber = 1;

  if (highestInvoice) {
    const lastInvoiceNumber = highestInvoice.invoiceNumber;
    // Replace the "ALINV" prefix and parse the number part
    invNumber = parseInt(lastInvoiceNumber.replace('ALINV', '')) + 1;
  }

  // Generate the new invoice ID with the "ALINV" prefix and ensure it's at least 3 digits
  return `ALINV${invNumber.toString().padStart(3, '0')}`;
};

const getAllPackingSlips = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;

  let query = {};

  if (filters.packingID) {
    query.packingID = { $regex: filters.packingID, $options: 'i' };
  }
  if (filters.dealerName) {
    query['orderDetails.dealerName'] = { $regex: filters.dealerName, $options: 'i' };
  }

  const packingSlips = await PackingSlip.find(query)
    .populate('order')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PackingSlip.countDocuments(query);

  return {
    packingSlips,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};


const createPackingSlip = async (packingSlipData) => {
  const newPackingSlip = new PackingSlip(packingSlipData);
  return await newPackingSlip.save();
};

const updatePackingSlip = async (id, packingSlipData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedPackingSlip = await PackingSlip.findByIdAndUpdate(
      id,
      packingSlipData,
      { new: true, session }
    );

    if (updatedPackingSlip.phase === "Completed") {
      const order = await Order.findById(updatedPackingSlip.order)
        .populate({
          path: 'dealer',
          populate: { path: 'province' }
        }).populate({
          path: 'products.product',  // Populate product details
          select: 'name children',   // Ensure children field is selected
      })
        .session(session);
        console.log(order)
      if (!order) {
        throw new Error('Associated order not found');
      }

      const invoiceNumber = await generateInvoiceId()
      // console.log(invoiceNumber)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (order.creditDueDays || 30));

      const newInvoice = new Invoice({
        invoiceNumber: invoiceNumber,
        dealer: {
            dealer: order.dealer._id,
            dealerName: order.billTo.companyName,
            dealerAddress: order.billTo.address
        },
        taxSlab: {
            gst: order.dealer.province.gst,
            hst: order.dealer.province.hst,
            qst: order.dealer.province.qst,
            pst: order.dealer.province.pst,
            tax: order.dealer.province._id
        },
        order: order._id,
        purchaseOrderNumber: order.purchaseOrderNumber,
        products: order.products.map(product => {
            // Check if product.product and product.product.children are defined
            const childrenArray = product.product?.children || [];
            const child = childrenArray.find(c => c.SKU === product.childSKU);
    
            return {
                parentName: product.product.name,        // The main product's name
                childSKU: product.childSKU,              // SKU for the child product
                childName: child ? child.name : '',      // Name of the child product if found
                quantity: product.quantity,
                description: product.description,
                price: product.price
            };
        }),
        dueDate: dueDate,
        type: "Invoice",
        totalAmount: order.grandTotal,
        dueAmount: order.grandTotal,
        invoiceStatus: "unpaid"
    });
    

      const savedInvoice = await newInvoice.save({ session });

      order.invoiceStatus = "Invoiced";
      order.assignedInvoice = savedInvoice._id;
      await order.save({ session });
    }

    await session.commitTransaction();
    return updatedPackingSlip;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Failed to update packing slip: ' + error.message);
  } finally {
    session.endSession();
  }
};

const deletePackingSlip = async (id) => {
  return await PackingSlip.findByIdAndDelete(id);
};

module.exports = {
  getPackingSlipById,
  createPackingSlip,
  updatePackingSlip,
  deletePackingSlip,
  getAllPackingSlips
};
