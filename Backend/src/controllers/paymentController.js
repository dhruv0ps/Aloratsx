const PaymentService = require('../services/paymentService');

class PaymentController {
    getUnpaidInvoices = async (req, res) => {
        try {
            const { dealerId } = req.params;
            const invoices = await PaymentService.getUnpaidInvoices(dealerId);
            return res.status(200).json({ status: true, data: invoices, err: {} });
        } catch (error) {
            return res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    validateCreditMemo = async (req, res) => {
        try {
            const { code, dealerId } = req.body;
            const creditMemo = await PaymentService.validateCreditMemo(code, dealerId);
            return res.status(200).json({ status: true, data: creditMemo, err: {} });
        } catch (error) {
            return res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }

    createPayment = async (req, res) => {
        try {
            const paymentData = req.body;
            // console.log(paymentData)
            const newPayment = await PaymentService.createPayment(paymentData);
            return res.status(201).json({ status: true, data: newPayment, err: {} });
        } catch (error) {
            return res.status(400).json({ status: false, data: {}, err: error.message });
        }
    }
    getAllPayments = async (req, res) => {
        try {
            const { page, limit, filters } = req.body;
            const logs = await PaymentService.getPagedPayments(parseInt(page), parseInt(limit), filters);
            res.status(200).json({ status: true, data: logs, err: {} });
        } catch (error) {
            res.status(500).json({ status: false, data: {}, err: error.message });
        }
    };
}

module.exports = new PaymentController();