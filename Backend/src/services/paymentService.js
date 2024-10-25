const Invoice = require('../config/models/invoiceModel');
const CreditMemo = require('../config/models/creditModel');
const Payment = require('../config/models/paymentModel');
const { default: mongoose } = require('mongoose');

class PaymentService {
    getUnpaidInvoices = async (dealerId) => {
        try {
            const invoices = await Invoice.find({
                'dealer.dealer': dealerId,
                invoiceStatus: { $in: ['unpaid', 'partially paid'] }
            });
            return invoices;
        } catch (error) {
            console.error("Error fetching unpaid invoices:", error.message);
            throw new Error('Could not retrieve unpaid invoices');
        }
    }

    validateCreditMemo = async (code, dealerId) => {
        try {
            const creditMemo = await CreditMemo.findOne({ creditMemoId: code, dealer: dealerId, status: "PENDING" });
            if (!creditMemo) {
                throw new Error('Invalid or already used credit memo');
            }
            return creditMemo;
        } catch (error) {
            console.error("Error validating credit memo:", error.message);
            throw new Error('Error while validating credit memo');
        }
    }

    createPayment = async (paymentData) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { dealerId, totalAmount, paymentType, creditMemoId, mode, paymentDetails, ...modeDetails } = paymentData;

            if (paymentDetails.length < 1) {
                throw new Error("No Invoices were selected.");
            }

            // Check if all amounts are zero
            if (paymentDetails.every(detail => detail.amount === 0)) {
                throw new Error("All payment amounts are zero.");
            }

            // Calculate sum of payment amounts
            const totalPaymentAmount = paymentDetails.reduce((sum, detail) => sum + detail.amount, 0);

            // Check if totalAmount is greater than sum of payment amounts
            if (totalAmount > totalPaymentAmount) {
                throw new Error("Total amount is greater than the sum of individual payment amounts.");
            }

            // Validate each payment amount against invoice due amount
            for (const detail of paymentDetails) {
                const invoice = await Invoice.findById(detail.invoice).session(session);
                if (!invoice) {
                    throw new Error(`Invoice ${detail.invoice} not found.`);
                }
                if (detail.amount > invoice.dueAmount) {
                    throw new Error(`Payment amount ${detail.amount} is greater than due amount ${invoice.dueAmount} for invoice ${detail.invoice}.`);
                }
            }

            if (creditMemoId) {
                const creditMemo = await this.validateCreditMemo(creditMemoId, dealerId);
                if (creditMemo.amount > totalAmount) {
                    throw new Error('Credit memo is not applicable on this amount.');
                }
            }

            const newPayment = new Payment({
                dealer: dealerId,
                totalAmount,
                paymentType,
                creditMemo: creditMemoId,
                mode,
                paymentDetails,
                ...modeDetails
            });

            await newPayment.save({ session });

            for (const detail of paymentDetails) {
                const invoice = await Invoice.findById(detail.invoice);
                const newDueAmount = invoice.dueAmount - detail.amount;
                const newPaidAmount = invoice.paidAmount + detail.amount;

                let invoiceStatus;
                if (newDueAmount <= 0) {
                    invoiceStatus = 'fully paid';
                } else if (newPaidAmount > 0) {
                    invoiceStatus = 'partially paid';
                } else {
                    invoiceStatus = invoice.invoiceStatus;
                }

                await Invoice.findByIdAndUpdate(detail.invoice, {
                    $set: {
                        dueAmount: newDueAmount,
                        paidAmount: newPaidAmount,
                        invoiceStatus: invoiceStatus
                    }
                }, { session });
            }

            if (creditMemoId) {
                await CreditMemo.findByIdAndUpdate(creditMemoId, { status: "REDEEMED" }, { session });
            }

            await session.commitTransaction();
            return newPayment;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error creating payment:", error.message);
            throw new Error('Payment creation failed: ' + error.message);
        } finally {
            session.endSession();
        }
    }
    getPagedPayments = async (page = 1, limit = 20, filters = {}) => {
        const skip = (page - 1) * limit;

        let query = {};

        if (filters.dealer) {
            query.dealer = filters.dealer;
        }
        if (filters.paymentType) {
            query.paymentType = filters.paymentType;
        }
        if (filters.mode) {
            query.mode = filters.mode;
        }
        if (filters.minAmount) {
            query.totalAmount = { $gte: filters.minAmount };
        }
        if (filters.maxAmount) {
            query.totalAmount = { ...query.totalAmount, $lte: filters.maxAmount };
        }
        if (filters.startDate) {
            query.createdAt = { $gte: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
        }

        const payments = await Payment.find(query)
            .populate('dealer')
            .populate('creditMemo')
            .populate('paymentDetails.invoice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments(query);

        return {
            payments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalPayments: total
        };
    };
}

module.exports = new PaymentService();
