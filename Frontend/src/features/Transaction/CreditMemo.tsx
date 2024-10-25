import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlus } from 'react-icons/fa';
import { creditMemoApis } from '../../config/apiRoutes/creditMemoRoutes';
import AutoCompleteDealerInput from '../../util/AutoCompleteDealer';
import { ApprovedDealer } from '../../config/models/dealer';
import { Button, Table, Spinner, TextInput, Select } from 'flowbite-react';
import { CreditMemoForm } from '../../config/models/payment';

interface NewCreditMemo {
  amount: number;
  reason: string;
  status: string;
}

export default function CreditMemoManagement() {
  const [formState, setFormState] = useState<NewCreditMemo>({
    amount: 0,
    reason: '',
    status: 'PENDING',
  });
  const [selectedDealer, setSelectedDealer] = useState<ApprovedDealer | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [creditMemos, setCreditMemos] = useState<CreditMemoForm[]>([]);
  const [filters, setFilters] = useState({
    dealer: '',
    status: '',
    creditMemoId: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadCreditMemos();
  }, []);

  const loadCreditMemos = async () => {
    try {
      setLoading(true);
      const response = await creditMemoApis.getAllCreditMemos();
      setCreditMemos(response.data);
    } catch (error) {
      console.error('Error fetching credit memos:', error);
      toast.error('Failed to load credit memos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleDealerChange = (dealer: ApprovedDealer) => {
    setSelectedDealer(dealer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) {
      toast.error("Please select a dealer");
      return;
    }
    setLoading(true);
    try {
      const creditMemoData = {
        dealer: selectedDealer._id,
        amount: formState.amount,
        reason: formState.reason,
        status: formState.status
      };
      const res = await creditMemoApis.createCreditMemo(creditMemoData);
      if (res.data) {
        toast.success('New credit memo added successfully');
        setShowForm(false);
        loadCreditMemos();
      }
    } catch (error) {
      toast.error('Failed to add credit memo');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredCreditMemos = creditMemos.filter(memo => {
    return (
      (filters.dealer === '' || memo.dealer.toLowerCase().includes(filters.dealer.toLowerCase())) &&
      (filters.status === '' || memo.status === filters.status) &&
      (filters.creditMemoId === '' || memo.creditMemoId.toLowerCase().includes(filters.creditMemoId.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mt-5">
      <button
        onClick={() => navigate(-1)}
        className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Credit Memo Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Create and manage credit memos efficiently.</p>
        </div>


        {/* New Credit Memo Form */}
        <div className="mb-6 flex justify-center sm:justify-start text-black">
          <Button color={'dark'} className='flex items-center' onClick={() => setShowForm(!showForm)}>
            <FaPlus className="mr-2 h-4 w-4 mt-0.5" /> {showForm ? 'Hide Form' : 'New Credit Memo'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dealer</label>
                  <AutoCompleteDealerInput
                    value={selectedDealer?.companyName || ""}
                    onChange={handleDealerChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formState.amount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    placeholder="Credit memo amount"
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input
                    type="text"
                    name="reason"
                    value={formState.reason}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    placeholder="Reason for credit memo"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formState.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div> */}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
              >
                {loading ? 'Processing...' : 'Create Credit Memo'}
              </button>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-8 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextInput
              id="creditMemoId"
              name="creditMemoId"
              placeholder="Search by ID"
              value={filters.creditMemoId}
              onChange={handleFilterChange}
              className="mb-4 md:mb-0"
            />
            <TextInput
              id="dealer"
              name="dealer"
              placeholder="Search by Dealer"
              value={filters.dealer}
              onChange={handleFilterChange}
              className="mb-4 md:mb-0"
            />
            <Select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mb-4 md:mb-0"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REDEEMED">Redeemed</option>
            </Select>
          </div>
        </div>


        {/* Credit Memo Table */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="xl" />
            </div>
          ) : (
            <Table>
              <Table.Head>
                <Table.HeadCell>ID</Table.HeadCell>
                <Table.HeadCell>Dealer Name</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Reason</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredCreditMemos.map((memo) => (
                  <Table.Row key={memo.creditMemoId} className="bg-white">
                    <Table.Cell className="font-medium text-gray-900">{memo.creditMemoId}</Table.Cell>
                    <Table.Cell>{memo.dealer}</Table.Cell>
                    <Table.Cell>${memo.amount.toFixed(2)}</Table.Cell>
                    <Table.Cell>{memo.reason}</Table.Cell>
                    <Table.Cell>{new Date(memo.date).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>{memo.status}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
