const creditMemoService = require('../services/creditMemoService');

const creditMemoController = {
  // Create a new credit memo
  createCreditMemo: async (req, res) => {
    try {
      const creditMemoData = {
        dealer: req.body.dealer,
        amount: req.body.amount,
        reason: req.body.reason
      };
      const result = await creditMemoService.createCreditMemo(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get all credit memos
  getAllCreditMemos: async (req, res) => {
    try {
      const creditMemos = await creditMemoService.getAllCreditMemo();
      res.status(200).json(creditMemos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single credit memo by ID
  getCreditMemoById: async (req, res) => {
    try {
      const { id } = req.body
      // console.log(id)
      console.log(req.params.creditMemoId)
      const creditMemo = await creditMemoService.getCreditMemoById(memoId).populate('dealer');
      if (creditMemo) {
        res.status(200).json(creditMemo);
      } else {
        res.status(404).json({ message: "Credit memo not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a credit memo
  updateCreditMemo: async (req, res) => {
    try {
      const updateData = {
        amount: req.body.amount,
        reason: req.body.reason,
        status: req.body.status
      };
      
      const result = await creditMemoService.updateCreditMemo(req.params.creditMemoId, updateData);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = creditMemoController;