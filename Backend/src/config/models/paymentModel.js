const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentDetailSchema = new Schema({
  invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true }
});

const paymentSchema = new Schema(
  {
    dealer: { type: Schema.Types.ObjectId, ref: 'ApprovedDealers', required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['Credit', 'Debit'], required: true },
    creditMemo: { type: Schema.Types.ObjectId, ref: 'CreditMemo' },
    mode: {
      type: String,
      enum: ['Online', 'Interac', 'Finance', 'Cash', 'Card', 'CreditMemo', 'Cheque', 'CreditCard', 'DebitCard'], // Added CreditCard and DebitCard
      required: true
    },
    txn_id: { type: String, trim: true },
    link: { type: String, trim: true },
    sender_name: { type: String, trim: true },
    sender_email: { type: String, trim: true },
    institution_name: { type: String, trim: true },
    finance_id: { type: String, trim: true },
    checkNumber: { type: String, trim: true }, // For Cheque
    chequeDate: { type: Date }, // For Cheque
    cardNumber: { type: String, trim: true }, // Added for Credit/Debit Card
    cardHolderName: { type: String, trim: true }, // Added for Credit/Debit Card
    expiryDate: { type: String, trim: true }, // Added for Credit/Debit Card
    paymentDetails: [paymentDetailSchema]
  },
  { timestamps: true }
);

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
  if (this.mode === 'Cheque' && (!this.checkNumber || !this.chequeDate)) {
    return next(new Error('Check number and cheque date are required for cheque payments'));
  }
  if ((this.mode === 'CreditCard' || this.mode === 'DebitCard') && (!this.cardNumber || !this.cardHolderName || !this.expiryDate)) {
    return next(new Error('Card number, cardholder name, and expiry date are required for credit/debit card payments'));
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
