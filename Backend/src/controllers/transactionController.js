const {
  createTransaction,
  getAllTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionByTransactionId,
  getTransactionByDealer
} = require("../services/transactionService");

module.exports.createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;

    const transaction = await createTransaction(transactionData);

    res.status(200).json({
      status: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      err: error.message,
    });
  }
};

module.exports.getTransactions = async (req, res) => {
  try {
    // Fetch transactions using the service method
    const transactions = await getAllTransaction();

    res.status(200).json({
      status: true,
      transaction: {
        transactions: transactions,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error); // Log the error
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

exports.updateTransactionController = async (req, res) => {
  const { transactionId } = req.params; // Get transactionId from request parameters
  const updateData = req.body; // Get update data from request body

  try {
    // Call the service function to update the transaction
    const result = await updateTransaction(transactionId, updateData);

    // Respond with the success message and updated transaction data
    res.status(200).json(result);
  } catch (error) {
    // Respond with an error message and status code
    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

exports.deleteTransactionController = async (req, res) => {
  const { transactionId } = req.body; // Get transactionId from request parameters

  try {
    // Call the service function to delete the transaction
    const result = await deleteTransaction(transactionId);

    // Respond with the success message
    res.status(200).json(result);
  } catch (error) {
    // Respond with an error message and status code
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

exports.getTransactionByTransactionId = async (req, res) => {
  const { transactionId } = req.body;

  try {
    // Fetch transactions using the service method
    const transactions = await getTransactionByTransactionId(transactionId);

    res.status(200).json({
      status: true,
      transaction: transactions
    });
  } catch (error) {
    console.error("Error fetching transactions:", error); // Log the error
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
}


exports.getTransactionsByDealer = async (req, res) => {
  const { dealerId } = req.params
  if (!dealerId)
    return res.json({ status: false, data: {}, err: "Incomplete params were supplied" })
  try {
    const transactions = await getTransactionByDealer(dealerId);
    return res.json({ status: true, data: transactions, err: {} })
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
}