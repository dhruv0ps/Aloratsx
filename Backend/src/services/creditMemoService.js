const mongoose = require('mongoose');
const CreditMemo = require('../config/models/creditModel');
const { ApprovedDealer } = require("../config/models/dealerApproved");

module.exports.createCreditMemo = async (creditMemoData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const creditAmount = parseFloat(creditMemoData.amount);

    // Ensure credit amount is positive
    if (creditAmount <= 0) {
      throw new Error("Credit amount must be greater than zero");
    }

    // Find the dealer
    const dealer = await ApprovedDealer.findById(creditMemoData.dealer).session(session);
    if (!dealer) {
      throw new Error("Dealer not found");
    }

    // Generate the next credit memo ID
    let lastId = 0;
    const lastCreditMemo = await CreditMemo.findOne().sort({ createdAt: -1 }).limit(1).session(session);

    if (lastCreditMemo) {
      const lastCreditMemoId = lastCreditMemo.creditMemoId;
      lastId = parseInt(lastCreditMemoId.replace('LSCM', '')) || 0;
    }

    const nextId = lastId + 1;
    const creditMemoId = `LSCM${nextId.toString().padStart(3, '0')}`;

    // Create a new credit memo record
    const creditMemo = new CreditMemo({
      creditMemoId: creditMemoId,
      amount: creditAmount,
      reason: creditMemoData.reason,
      status: 'PENDING',
      dealer: dealer._id,
      dealerName: dealer.companyName,
      createdBy: creditMemoData.userId,
      updatedBy: creditMemoData.userId
    });

    await creditMemo.save({ session });

    await session.commitTransaction();

    // Return the credit memo with the dealer's company name
    return {
      message: "Credit memo created successfully",
      creditMemo: {
        ...creditMemo.toObject(),
        dealer: dealer.companyName
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Failed to create credit memo: " + error.message);
  } finally {
    session.endSession();
  }
};
module.exports.getAllCreditMemo = async () => {
  try {
    // Check if we can connect to the database
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not ready");
    }

    // Fetch all credit memos
    const creditMemos = await CreditMemo.find().lean();

    // Format the credit memos to use dealerName instead of trying to populate dealer
    const formattedCreditMemos = creditMemos.map(memo => ({
      ...memo,
      dealer: memo.dealerName // Use dealerName instead of trying to populate dealer
    }));

    return formattedCreditMemos;
  } catch (error) {
    console.error("Error in getAllCreditMemo:", error);
    throw new Error(`Failed to fetch credit memos: ${error.message}`);
  }
};

module.exports.getCreditMemoById = async (creditMemoId) => {
  try {
    const creditMemo = await CreditMemo.findOne({ creditMemoId: creditMemoId }).lean();
    if (!creditMemo) {
      throw new Error("Credit memo not found");
    }
    return {
      ...creditMemo,
      dealer: creditMemo.dealerName // Use dealerName instead of populating dealer
    };
  } catch (error) {
    throw new Error("Failed to fetch credit memo: " + error.message);
  }
},

  module.exports.updateCreditMemo = async (creditMemoId, updateData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      
      const creditMemo = await CreditMemo.findOne({ creditMemoId: creditMemoId }).session(session);
      if (!creditMemo) {
        throw new Error("Credit memo not found");
      }

      const allowedUpdates = ['amount', 'reason', 'status'];
      const updates = Object.keys(updateData).filter(key => allowedUpdates.includes(key));

      updates.forEach(update => {
        creditMemo[update] = updateData[update];
      });

      if (updateData.amount) {
        const newAmount = parseFloat(updateData.amount);
        if (newAmount <= 0) {
          throw new Error("Credit amount must be greater than zero");
        }
        creditMemo.amount = newAmount;
      }

      if (updateData.status && !['PENDING', 'REDEEMED'].includes(updateData.status)) {
        throw new Error("Invalid status. Must be either PENDING or REDEEMED");
      }

      await creditMemo.save({ session });

      await session.commitTransaction();
      return {
        message: "Credit memo updated successfully",
        creditMemo: {
          ...creditMemo.toObject(),
          dealer: creditMemo.dealerName // Use dealerName instead of populating dealer
        }
      };
    } catch (error) {
      await session.abortTransaction();
      throw new Error("Failed to update credit memo: " + error.message);
    } finally {
      session.endSession();
    }
  }
