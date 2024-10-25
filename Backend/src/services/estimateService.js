const mongoose = require("mongoose");
const Estimate = require("../config/models/estimateModel");
const Order = require("../config/models/orderModel");
const TaxSlab = require("../config/models/taxSlabModel");
const { ApprovedDealer } = require("../config/models/dealerApproved");

module.exports.generateEstimate = async (estimateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const dealer = await ApprovedDealer.findById(estimateData.dealer).session(session);
    if (!dealer) {
      throw new Error("Dealer not found");
    }

    // Retrieve dealer's credit details
    const creditDueDays = parseInt(dealer.creditDueDays);
    const creditDueAmount = parseFloat(dealer.creditDueAmount);

    const orderDetails = await Order.find({
      _id: { $in: estimateData.orders },
    }).session(session);
    if (orderDetails.length === 0) {
      throw new Error("No valid orders found for this dealer");
    }

    if (orderDetails.length !== estimateData.orders.length) {
      throw new Error("Some orders do not belong to the selected dealer");
    }

    // Calculate total amount from all selected orders
    const totalAmount = estimateData.type.toLowerCase() === 'estimate' ? estimateData.grandTotal : orderDetails.reduce((sum, order) => sum + order.grandTotal, 0);
    // Find tax slab details
    const taxSlab = await TaxSlab.findById(estimateData.taxSlab).session(session);
    if (!taxSlab) {
      throw new Error("Tax Slab not found");
    }

    // Get the current date
    const currentDate = new Date();

    // Calculate due date based on dealer's creditDueDays
    let dueDate = new Date(currentDate);
    dueDate.setDate(currentDate.getDate() + creditDueDays);

    // If a custom due date is provided, convert it from DD/MM/YYYY to ISODate
    if (estimateData.dueDate) {
      const [dd, mm, yyyy] = estimateData.dueDate.split("/");
      dueDate = new Date(`${yyyy}-${mm}-${dd}`);
    }

    // Determine the estimate status based on the dueAmount and totalAmount
    let dueAmount = totalAmount; // Due amount is set to the totalAmount of all orders
    let estimateStatus = dueAmount === 0 ? "Paid" : "Unpaid";

    // Generate the estimate number
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${day}${month}${year}`;
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of the day
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // End of the day

    const prefix = estimateData.type.toLowerCase() === 'estimate' ? 'EST' : 'INV';
    // Get all estimates/estimates created today
    const documentsToday = await Estimate.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      estimateNumber: { $regex: `^${prefix}` } // Only count documents with the same prefix
    }).session(session);

    const nextNumber = `${prefix}${formattedDate}${String(
      documentsToday.length + 1
    ).padStart(3, "0")}`;

    // Create new estimate
    const estimate = new Estimate({
      dealer: dealer._id,
      taxSlab: taxSlab._id,
      orders: orderDetails.map(order => order._id),
      dueDate: dueDate,
      estimateNumber: nextNumber,
      totalAmount: totalAmount.toString(),
      dueAmount: dueAmount.toString(),
      estimateStatus: estimateStatus,
      type: estimateData.type
    });

    await estimate.save({ session });

    // Update all associated orders
    for (const order of orderDetails) {
      // order.estimateStatus = estimateData.type === 'estimate' ? "Estimated" : "Estimated";
      order.estimateStatus = "Estimated";
      order.assignedEstimate = estimate._id;
      await order.save({ session });
    }

    await session.commitTransaction();
    return estimate;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports.getAllEstimates = async () => {
  try {
    // Fetch all estimates with specified fields
    const estimates = await Estimate.find({})
      .select(
        "_id estimateNumber totalAmount dueAmount dueDate estimateStatus orders taxSlab"
      )
      .populate({
        path: "orders", // Populate 'orders' field to get order details
        select: "billTo", // Include 'billTo' field from the Order schema
      })
      .populate({
        path: "taxSlab", // Populate 'taxSlab' field to get tax slab details
        select: "name", // Include 'name' field from the TaxSlab schema
      });

    // Map the results to include only the specified fields
    // console.log(estimates[0],"......................")
    const result = estimates.map((estimate) => {
      const billTo = estimate.orders.map((bill) => bill.billTo);
      const address = billTo?.address;
      return {
        _id: estimate._id,
        estimateID: estimate.estimateNumber, // Use estimateNumber as Estimate ID
        builtTo: billTo,
        totalAmount: estimate.totalAmount,
        dueAmount: estimate.dueAmount,
        dueDate: estimate.dueDate.toLocaleDateString("en-GB"), // Format date as DD/MM/YYYY
        status: estimate.estimateStatus,
        taxSlab: estimate.taxSlab?.name, // Include the name of the tax slab
      };
    });

    return result
  } catch (error) {
    throw new Error("Failed to fetch estimates: " + error.message);
  }
};


module.exports.getEstimateListbyDealer = async (id) => {
  try {
    // Fetch estimates from the database
    const estimates = await Estimate.find({ dealer: id })
      .select("estimateNumber totalAmount dueAmount dealer");

    // Filter out estimates with dueAmount equal to 0
    const filteredEstimates = estimates.filter(estimate => estimate.dueAmount > 0);

    // if (filteredEstimates.length === 0) {
    //   throw new Error("No estimates with due amount found for this dealer");
    // }

    return filteredEstimates;
  } catch (error) {
    throw new Error("Failed to fetch estimates: " + error.message);
  }
};

module.exports.getEstimateByEstimateNum = async (estimateNumber) => {
  try {
    const data = await Estimate.findOne({ estimateNumber: estimateNumber })
      .populate({
        path: 'orders',
        populate: {
          path: 'products.product',
        }
      })
      .populate('dealer')
      .populate('taxSlab');
    return data;
  } catch (error) {
    throw new Error("Failed to fetch estimate: " + error.message);
  }
};
module.exports.deleteEstimate = async (estimateId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the estimate
    const estimate = await Estimate.findById(estimateId).session(session);
    if (!estimate) {
      throw new Error("Estimate not found");
    }

    // Update associated orders
    const updateOrdersResult = await Order.updateMany(
      { _id: { $in: estimate.orders } },
      { $set: { estimateStatus: "Pending", assignedEstimate: null } },
      { session }
    );

    if (updateOrdersResult.modifiedCount !== estimate.orders.length) {
      throw new Error("Failed to update all associated orders");
    }

    // Delete the estimate
    await Estimate.findByIdAndDelete(estimateId).session(session);

    await session.commitTransaction();
    return { message: "Estimate deleted successfully and orders updated to Pending status" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
