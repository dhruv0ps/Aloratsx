const mongoose = require('mongoose');
const { Schema } = mongoose;

const denominationSchema = new Schema({
    value: { type: Number, required: true },
    count: { type: Number, required: true }
});

const paymentDetailSchema = new Schema({
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true }
});

const paymentSchema = new Schema({
    dealer: { type: Schema.Types.ObjectId, ref: 'ApprovedDealers', required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['Credit', 'Debit'], required: true },
    creditMemo: { type: Schema.Types.ObjectId, ref: 'CreditMemo' },
    mode: {
        type: String,
        enum: ['Online', 'Interac', 'Finance', 'Cash', 'Card', 'CreditMemo'],
        required: true
    },
    txn_id: { type: String, trim: true },
    link: { type: String, trim: true },
    sender_name: { type: String, trim: true },
    sender_email: { type: String, trim: true },
    institution_name: { type: String, trim: true },
    finance_id: { type: String, trim: true },
    denominations: [denominationSchema],
    paymentDetails: [paymentDetailSchema],
}, { timestamps: true });

paymentSchema.pre('save', function (next) {
    if (this.mode === 'Online' && (!this.txn_id || !this.link)) {
        return next(new Error('Transaction ID and link are required for online payments'));
    }
    if (this.mode === 'Interac' && (!this.sender_name || !this.sender_email)) {
        return next(new Error('Sender name and email are required for Interac payments'));
    }
    if (this.mode === 'Finance' && (!this.institution_name || !this.finance_id)) {
        return next(new Error('Institution name and finance ID are required for finance payments'));
    }
    if (this.mode === 'Cash' && (!this.denominations || this.denominations.length === 0)) {
        return next(new Error('Denominations are required for cash payments'));
    }
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;