const mongoose = require('mongoose');
const { ApprovedDealer } = require("../config/models/dealerApproved");
const Invoice = require("../config/models/invoiceModel");
const Transaction = require("../config/models/transactionModel");
const CreditMemo = require('../config/models/creditModel')

module.exports.createTransaction = async (transactionData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let invoice, dealer, dueAmount, captureAmount;
    const transactionType = transactionData.type || 'Credit'; // Default to credit if not specified

    if (transactionType === 'Credit') {
      // Regular transaction (credit)
      invoice = await Invoice.findOne({ invoiceNumber: transactionData.invoiceNumber }).session(session);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.invoiceStatus !== 'Unpaid' && invoice.invoiceStatus !== 'Partially Paid') {
        throw new Error("Invoice not eligible for transaction");
      }

      dealer = await ApprovedDealer.findById(invoice.dealer).session(session);
      if (!dealer) {
        throw new Error("Dealer not found");
      }

      dueAmount = parseFloat(invoice.dueAmount);
      captureAmount = parseFloat(transactionData.capturedAmount);

      if (captureAmount > dueAmount) {
        throw new Error("Captured amount cannot be greater than due amount");
      }

      // Update invoice
      invoice.dueAmount = dueAmount - captureAmount;
      invoice.invoiceStatus = invoice.dueAmount === 0 ? "Paid" : "Partially Paid";
      await invoice.save({ session });

    } else if (transactionType === 'Debit') {
      // Credit memo transaction (debit)
      const creditMemo = await CreditMemo.findOne({ creditMemoId: transactionData.creditMemoId }).session(session);
      if (!creditMemo) {
        throw new Error("Credit memo not found");
      }

      if (creditMemo.status !== 'PENDING') {
        throw new Error("Credit memo is not eligible for redemption");
      }

      dealer = await ApprovedDealer.findById(creditMemo.dealer).session(session);
      if (!dealer) {
        throw new Error("Dealer not found");
      }

      captureAmount = parseFloat(creditMemo.amount);

      // Update credit memo status
      creditMemo.status = 'REDEEMED';
      await creditMemo.save({ session });

    } else {
      throw new Error("Invalid transaction type");
    }

    // Generate the next transaction ID
    let lastId = 0;
    const lastTransaction = await Transaction.findOne().sort({ createdAt: -1 }).limit(1).session(session);

    if (lastTransaction) {
      const lastTransactionId = lastTransaction.transactionId;
      lastId = parseInt(lastTransactionId.replace('TXN', '')) || 0;
    }

    const nextId = lastId + 1;
    const transactionId = `TXN${nextId.toString().padStart(3, '0')}`;

    // Create a new transaction record
    const transaction = new Transaction({
      dealer: dealer._id,
      invoiceId: invoice ? invoice._id : null,
      creditMemoId: transactionType === 'Debit' ? transactionData.creditMemoId : null,
      capturedAmount: captureAmount,
      transactionId: transactionId,
      type: transactionType
    });

    await transaction.save({ session });

    await session.commitTransaction();
    return { message: "Transaction created successfully", transaction };
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Failed to create transaction: " + error.message);
  } finally {
    session.endSession();
  }
};

module.exports.getAllTransaction = async () => {
  try {
    // Fetch transactions from the database
    const transactions = await Transaction.find({})
      .populate('dealer', 'contactPersonName')
      .populate('invoiceId', 'invoiceNumber');

    const formattedTransactions = transactions.map(transaction => ({
      dealer: transaction.dealer ? transaction.dealer.contactPersonName : 'N/A',
      invoiceId: transaction.invoiceId ? transaction.invoiceId.invoiceNumber : 'N/A',
      // capturedAmount: transaction.capturedAmount,
      transactionId: transaction.transactionId,
      transactionDate: transaction.createdAt,
    }));

    return formattedTransactions; // Return the formatted transactions directly
  } catch (error) {
    throw new Error("Failed to fetch transactions: " + error.message);
  }
};

module.exports.getTransactionByDealer = async (dealerId) => {
  try {
    return await Transaction.find({ dealer: dealerId })
  } catch (error) {
    throw error
  }
};

module.exports.updateTransaction = async (transactionId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find the transaction using the transactionId
    const transaction = await Transaction.findOne({ _id: transactionId });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Validate the new captured amount
    const newCapturedAmount = parseFloat(updateData.capturedAmount);
    if (isNaN(newCapturedAmount) || newCapturedAmount <= 0) {
      throw new Error("Invalid captured amount");
    }

    // Find the associated invoice
    const invoice = await Invoice.findById(transaction.invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Ensure the new captured amount does not exceed the invoice's due amount
    const oldCapturedAmount = parseFloat(transaction.capturedAmount);
    const dueAmount = parseFloat(invoice.dueAmount);
    const updatedDueAmount = dueAmount + oldCapturedAmount - newCapturedAmount;

    if (newCapturedAmount > dueAmount + oldCapturedAmount) {
      throw new Error("Captured amount cannot exceed due amount");
    }

    // Update invoice's dueAmount and status if necessary
    invoice.dueAmount = updatedDueAmount;

    if (updatedDueAmount === 0) {
      invoice.invoiceStatus = "Paid";
    } else {
      invoice.invoiceStatus = "Partially Paid";
    }

    await invoice.save({ session });

    // Update the transaction record
    transaction.capturedAmount = newCapturedAmount;
    await transaction.save({ session });

    await session.commitTransaction();
    return { message: "Transaction updated successfully", transaction };
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Failed to update transaction: " + error.message);
  } finally {
    session.endSession();
  }
};

module.exports.deleteTransaction = async (transactionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find the transaction using the transactionId
    const transaction = await Transaction.findOne({ transactionId: transactionId });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Find the associated invoice
    const invoice = await Invoice.findById(transaction.invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Adjust the invoice's dueAmount and status
    const oldCapturedAmount = parseFloat(transaction.capturedAmount);
    const dueAmount = parseFloat(invoice.dueAmount);
    const updatedDueAmount = dueAmount + oldCapturedAmount;

    // Update invoice's dueAmount and status if necessary
    invoice.dueAmount = updatedDueAmount;

    if (updatedDueAmount === 0) {
      invoice.invoiceStatus = "Paid";
    } else {
      invoice.invoiceStatus = "Partially Paid";
    }

    await invoice.save({ session });

    // Delete the transaction record
    await Transaction.deleteOne({ transactionId }, { session });

    await session.commitTransaction();
    return { message: "Transaction deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Failed to delete transaction: " + error.message);
  } finally {
    session.endSession();
  }
};

module.exports.getTransactionByTransactionId = async (transactionId) => {
  try {
    // Find the transaction using the transactionId
    const transaction = await Transaction.findOne({ transactionId: transactionId })
      .populate('dealer', 'contactPersonName')
      .populate('invoiceId', 'invoiceNumber dueAmount totalAmount');

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Format the transaction data
    const formattedTransaction = {
      transactionId: transaction.transactionId,
      dealer: transaction.dealer ? transaction.dealer.contactPersonName : 'N/A',
      invoiceNumber: transaction.invoiceId ? transaction.invoiceId.invoiceNumber : 'N/A',
      capturedAmount: transaction.capturedAmount,
      invoiceTotalAmount: transaction.invoiceId ? transaction.invoiceId.totalAmount : 'N/A',
      invoiceDueAmount: transaction.invoiceId ? transaction.invoiceId.dueAmount : 'N/A',
      transactionDate: transaction.createdAt,
    };

    return formattedTransaction;
  } catch (error) {
    throw new Error("Failed to fetch transaction: " + error.message);
  }
};