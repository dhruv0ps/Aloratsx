import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { invoiceApis } from '../../config/apiRoutes/InvoiceRoutes';
import Loading from '../../util/Loading';
import { Invoice } from '../../config/models/Invoice';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await invoiceApis.getAllInvoices({ page: currentPage, limit: 10 });
        setInvoices(response.data.invoices);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage]);

  const handleView = (id: string) => {
    navigate(`/yellowadmin/Invoice/${id}`);
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.dealer.dealerName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || invoice.invoiceStatus.toLowerCase() === statusFilter)
  );

  if (loading) return <Loading />;

  return (
    <div className="h-full border-l -mt-5 border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Invoice Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage all invoices for efficient billing and tracking.
          </p>
        </div>

        <div className="mb-6 flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice Number or Customer Name"
            className="w-full p-3 border rounded-lg shadow-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border rounded-lg shadow-sm"
          >
            <option value="all">All</option>
            <option value="fully paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-8 py-3 text-left ml-20  text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Order Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 ml-20 whitespace-nowrap text-sm font-medium">
                      <button
                        className="bg-gray-900 text-white py-2.5 px-4 ml-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                        onClick={() => handleView(invoice._id)}
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${invoice.invoiceStatus === 'fully paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {invoice.invoiceStatus}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.purchaseOrderNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dealer.dealerName}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
            
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
