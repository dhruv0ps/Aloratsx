import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaFilter } from 'react-icons/fa';
import { paymentApis } from '../../config/apiRoutes/paymentRoutes';
import { PaymentData } from '../../config/models/payment';
import Loading from '../../util/Loading';


export default function ViewPayments() {
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        dealer: '',
        paymentType: '',
        mode: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchPayments();
    }, [currentPage, filters]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApis.getPagedPayements({ page: currentPage, limit: 20, filters });
            setPayments(res.data.payments);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
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
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Payment Management
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage payments efficiently.
                    </p>
                </div>

                <div className="bg-white shadow-md sm:rounded-lg p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-800">Payments</h2>
                        <button
                            onClick={() => {/* Toggle filter visibility */ }}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <FaFilter className="w-5 h-5 mr-2" />
                            Filter
                        </button>
                    </div>

                    {/* Filter form (you can toggle its visibility) */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <input
                            type="text"
                            name="dealer"
                            value={filters.dealer}
                            onChange={handleFilterChange}
                            placeholder="Dealer"
                            className="px-4 py-2 border rounded-lg"
                        /> */}
                        <select
                            name="paymentType"
                            value={filters.paymentType}
                            onChange={(e) => handleFilterChange(e)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Payment Type</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                        <select
                            name="mode"
                            value={filters.mode}
                            onChange={(e) => handleFilterChange(e)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Payment Mode</option>
                            <option value="Online">Online</option>
                            <option value="Interac">Interac</option>
                            {/* <option value="Finance">Finance</option> */}
                            <option value="Cash">Cash</option>
                            <option value="CreditCard">CreditCard</option>
                            {/* <option value="Card">Card</option> */}
                            <option value="DebitCard">DebitCard</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                        {/* Add more filter inputs as needed */}
                    </div>

                    {loading ? <Loading /> : (
                        <div className="overflow-x-auto ">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Invoices
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Mode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Ref
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-600">
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{payment.dealer?.contactPersonName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">${payment.totalAmount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{payment.paymentDetails.map(item => item.invoice.invoiceNumber).join(', ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{payment.paymentType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{payment.mode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{payment.creditMemo?.creditMemoId || ""}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}