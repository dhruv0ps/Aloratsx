import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { Invoice } from '../../config/models/Invoice';
import { paymentApis } from '../../config/apiRoutes/paymentRoutes';
import AutoCompleteDealerInput from '../../util/AutoCompleteDealer';
import { CreditMemoData, PaymentForm } from '../../config/models/payment';
import { ApprovedDealer } from '../../config/models/dealer';
import Loading from '../../util/Loading';

// const canadianDenominations = [
//   { value: 100, label: '$100 bill' },
//   { value: 50, label: '$50 bill' },
//   { value: 20, label: '$20 bill' },
//   { value: 10, label: '$10 bill' },
//   { value: 5, label: '$5 bill' },
//   { value: 2, label: '$2 coin (Toonie)' },
//   { value: 1, label: '$1 coin (Loonie)' },
//   { value: 0.25, label: '25¢ (Quarter)' },
//   { value: 0.10, label: '10¢ (Dime)' },
//   { value: 0.05, label: '5¢ (Nickel)' },
// ];
interface BackendPaymentPayload {
  dealer: string;
  totalAmount: number;
  paymentType: 'Credit' | 'Debit';
  creditMemo?: string;
  mode: 'Online' | 'Interac' | 'Finance' | 'Cash' | 'Card' | 'CreditMemo';
  txn_id?: string;
  link?: string;
  sender_name?: string;
  sender_email?: string;
  institution_name?: string;
  finance_id?: string;
  checkNumber?: string,
  chequeDate?: string,
  denominations?: { value: number; count: number }[];
  paymentDetails: { invoice: string; amount: number }[];
  cardHolderName?: string,
  expiryDate?: string,
  cardNumber?: string,
}

export default function RecordPayment(): JSX.Element {
  const [formState, setFormState] = useState<PaymentForm>({
    dealer: null,
    useCreditMemo: false,
    creditMemoCode: '',
    paymentMode: '',
    amount: 0,
    txn_id: '',
    link: '',
    sender_name: '',
    sender_email: '',
    institution_name: '',
    finance_id: '',
    selectedInvoices: [],
    checkNumber: "",
    chequeDate: "",
    cardHolderName: '',
    expiryDate: '',
    cardNumber: '',
    // denominations: canadianDenominations.map(d => ({ value: d.value, count: 0 }))
  });
  const [creditMemo, setCreditMemo] = useState<CreditMemoData>()
  const [loading, setLoading] = useState<boolean>(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (formState.dealer) {
      fetchUnpaidInvoices(formState.dealer._id);
    }
  }, [formState.dealer]);

  useEffect(() => {
    if (formState.paymentMode === 'Cash') {
      const totalFromDenominations = calculateTotalFromDenominations();
      setFormState(prev => ({ ...prev, amount: totalFromDenominations || 0 }));
    }
  }, [formState.denominations, formState.paymentMode]);

  // const handleDenominationChange = (value: number, count: number): void => {
  //   setFormState(prev => ({
  //     ...prev,
  //     denominations: prev.denominations?.map(d =>
  //       d.value === value ? { ...d, count } : d
  //     ),
  //   }));
  // };

  const calculateTotalFromDenominations = () => {
    return formState.denominations?.reduce((total, d) => total + d.value * d.count, 0);
  };

  const fetchUnpaidInvoices = async (dealerId: string): Promise<void> => {
    try {
      setLoading(true)
      const res = await paymentApis.invoicesByDealer(dealerId);
      setUnpaidInvoices(res.data);
    } catch (error) {
      toast.error('Failed to fetch unpaid invoices');
    } finally {
      setLoading(false)
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDealerChange = (selectedDealer: ApprovedDealer | null): void => {
    setFormState((prev) => ({ ...prev, dealer: selectedDealer }));
  };

  const handlePaymentModeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const mode = e.target.value;
    setFormState((prev) => ({
      ...prev,
      paymentMode: mode,
      txn_id: '',
      link: '',
      sender_name: '',
      sender_email: '',
      institution_name: '',
      finance_id: '',
      checkNumber: '',
      chequeDate: '',
    }));
  };

  const handleInvoiceSelection = (invoiceId: string): void => {
    setFormState((prev) => {
      const updatedSelectedInvoices = prev.selectedInvoices.some(inv => inv.id === invoiceId)
        ? prev.selectedInvoices.filter(inv => inv.id !== invoiceId)
        : [...prev.selectedInvoices, { id: invoiceId, amount: 0 }];
      return { ...prev, selectedInvoices: updatedSelectedInvoices };
    });
  };

  const handleInvoiceAmountChange = (invoiceId: string, amount: string): void => {
    setFormState((prev) => ({
      ...prev,
      selectedInvoices: prev.selectedInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, amount: parseFloat(amount) } : inv
      ),
    }));
  };


  function transformToBackendPayload(formState: PaymentForm): BackendPaymentPayload {
    return {
      dealer: formState.dealer?._id || '',
      totalAmount: formState.amount,
      paymentType: !formState.useCreditMemo ? 'Credit' : 'Debit',
      creditMemo: formState.useCreditMemo ? creditMemo?._id : undefined,
      mode: formState.paymentMode as BackendPaymentPayload['mode'],
      txn_id: formState.txn_id || undefined,
      link: formState.link || undefined,
      sender_name: formState.sender_name || undefined,
      sender_email: formState.sender_email || undefined,
      institution_name: formState.institution_name || undefined,
      finance_id: formState.finance_id || undefined,
      denominations: formState.paymentMode === 'Cash' ? formState.denominations : undefined,
      checkNumber: formState.paymentMode === 'Cheque' ? formState.checkNumber : undefined, 
    chequeDate: formState.paymentMode === 'Cheque' ? formState.chequeDate : undefined, 
    cardNumber: (formState.paymentMode === 'CreditCard' || formState.paymentMode === 'DebitCard') ? formState.cardNumber : undefined, // Added for Credit/Debit Card
    cardHolderName: (formState.paymentMode === 'CreditCard' || formState.paymentMode === 'DebitCard') ? formState.cardHolderName : undefined, // Added for Credit/Debit Card
    expiryDate: (formState.paymentMode === 'CreditCard' || formState.paymentMode === 'DebitCard') ? formState.expiryDate : undefined, // Added for Credit/Debit Card
      paymentDetails: formState.selectedInvoices.map(inv => ({
        invoice: inv.id,
        amount: inv.amount
      }))
    };
  }
  const handleCheckMemo = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
    e.preventDefault()
    setLoading(true);
    try {
      const res = await paymentApis.validateMemo({ code: formState.creditMemoCode, dealerId: formState.dealer?._id });
      if (res.status) {
        setCreditMemo(res.data)
        setFormState(prev => ({ ...prev, amount: res.data.amount, paymentMode: 'CreditMemo' }))
        toast.success('Your Credit Memo code has been successfully applied!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      let totalPays = formState.selectedInvoices.reduce((acc, curr) => {
        return acc + curr.amount
      }, 0)
      if (totalPays > formState.amount) {
        toast.error("Invoice amount cannot be greater than the predefined amount!")
        return;
      }
      const backendPayload = transformToBackendPayload(formState);
      const res = await paymentApis.createPayment(backendPayload);
      if (res.status) {
        toast.success('Payment recorded successfully');
        navigate('/yellowadmin/Payment/PaymentList');
      }
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen border-l border-gray-200 bg-gray-50 -mt-5 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Record Payment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Record payments for dealers efficiently.
          </p>
        </div>

        <div className="bg-white rounded-md shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label htmlFor="dealer" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className='text-red-500'>*</span>Customer:
                </label>
                <AutoCompleteDealerInput value={formState.dealer?.contactPersonName || ''} onChange={handleDealerChange} />
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="useCreditMemo"
                    checked={formState.useCreditMemo}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Use Credit Memo</span>
                </label>
              </div>

              {formState.useCreditMemo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Memo Code
                  </label>
                  <div className='flex px-4 items-center rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors'>
                    <input
                      type="text"
                      name="creditMemoCode"
                      value={formState.creditMemoCode}
                      onChange={handleInputChange}
                      className="w-full pr-2 py-3 border-none"
                      placeholder="Enter credit memo code"
                    />
                    <button className='border-none hover:font-bold transition-all ease-in-out' onClick={(e) => handleCheckMemo(e)}>Apply</button>
                  </div>
                </div>
              )}

              {formState.useCreditMemo ? <></> : <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formState.paymentMode}
                  onChange={handlePaymentModeChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                >
                  <option value="">Select payment mode</option>
                  <option value="Online">Online</option>
                  <option value="Interac">Interac</option>
                  {/* <option value="Finance">Finance</option> */}
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  {/* <option value="Card">Card</option> */}
                  <option value="CreditCard">Credit Card</option> {/* Added Credit Card Option */}
                  <option value="DebitCard">Debit Card</option>
                </select>
              </div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  disabled={formState.useCreditMemo }
                  type="number"
                  name="amount"
                  value={formState.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Enter payment amount"
                />
              </div>

              {/* Conditional fields based on payment mode */}
              {formState.paymentMode === 'Online' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="txn_id"
                      value={formState.txn_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formState.link}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter payment link"
                    />
                  </div>
                </>
              )}

              {formState.paymentMode === 'Interac' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      name="sender_name"
                      value={formState.sender_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter sender name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      name="sender_email"
                      value={formState.sender_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter sender email"
                    />
                  </div>
                </>
              )}
{(formState.paymentMode === 'CreditCard' || formState.paymentMode === 'DebitCard') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formState.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter card number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={formState.cardHolderName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter cardholder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formState.expiryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="MM/YY"
                    />
                  </div>
                </>
              )}  
              {formState.paymentMode === 'Finance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institution_name"
                      value={formState.institution_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finance ID
                    </label>
                    <input
                      type="text"
                      name="finance_id"
                      value={formState.finance_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter finance ID"
                    />
                  </div>
                </>
              )}

              {/* {formState.paymentMode === 'Cash' && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denominations
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {canadianDenominations.map((denomination) => (
                      <div key={denomination.value} className="flex items-center space-x-2">
                        <label className="text-sm w-20">{denomination.label}</label>
                        <input
                          type="number"
                          min="0"
                          value={formState.denominations?.find(d => d.value === denomination.value)?.count || 0}
                          onChange={(e) => handleDenominationChange(denomination.value, parseInt(e.target.value))}
                          className="px-2 py-2 border border-gray-300 rounded w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Total from denominations: ${calculateTotalFromDenominations()?.toFixed(2)}
                  </p>
                </div>
              )} */}

              {
                formState.paymentMode === "Cheque" && (
                  <>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      name="checkNumber"
                      value={formState.checkNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      placeholder="Enter check number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      name="chequeDate"
                      value={formState.chequeDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    />
                  </div>
                  </>
                )
              }
            </div>

            {
              // #region Unpaid Invoices Section
            }

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Unpaid Invoices</h3>
              {loading ? <Loading /> : unpaidInvoices.length > 0 ? <div className="space-y-4">
                {unpaidInvoices.map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">Due: ${invoice.dueAmount?.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={formState.selectedInvoices.some(inv => inv.id === invoice._id)}
                        onChange={() => handleInvoiceSelection(invoice._id)}
                        className="form-checkbox h-5 w-5 text-gray-600"
                      />
                      {formState.selectedInvoices.some(inv => inv.id === invoice._id) && (
                        <input
                          type="number"
                          value={formState.selectedInvoices.find(inv => inv.id === invoice._id)?.amount || ''}
                          onChange={(e) => handleInvoiceAmountChange(invoice._id, e.target.value)}
                          className="w-24 px-2 py-1 border rounded"
                          placeholder="Amount"
                          max={invoice.dueAmount}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div> : <p className='text-gray-500 my-8 text-center'>No Unpaid invoices found.</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}