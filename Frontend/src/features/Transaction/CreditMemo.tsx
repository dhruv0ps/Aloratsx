import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Import the trash icon
import { creditMemoApis } from '../../config/apiRoutes/creditMemoRoutes';
import AutoCompleteDealerInput from '../../util/AutoCompleteDealer';
import { ApprovedDealer } from '../../config/models/dealer';
import { Button, Table, Spinner, TextInput, Select } from 'flowbite-react';
import { CreditMemoForm } from '../../config/models/payment';
import showConfirmationModal from '../../util/confirmationUtil';
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
  const [editMode, setEditMode] = useState(false);
  const [creditMemos, setCreditMemos] = useState<CreditMemoForm[]>([]);
  const [selectedCreditMemo, setSelectedCreditMemo] = useState<CreditMemoForm | null>(null);
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

      if (editMode && selectedCreditMemo) {
        const res = await creditMemoApis.updateCreditMemo(selectedCreditMemo.creditMemoId, creditMemoData);
        if (res.data) {
          toast.success('Credit memo updated successfully');
        }
      } else {
        const res = await creditMemoApis.createCreditMemo(creditMemoData);
        if (res.data) {
          toast.success('New credit memo added successfully');
        }
      }

      setShowForm(false);
      loadCreditMemos();
    } catch (error) {
      toast.error('Failed to save credit memo');
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

  const handleDelete = async (creditMemoId: string) => {
    try {
      const confirmed = await showConfirmationModal("The credit memo cannot come once deleted. Are you sure you would like to continue?")
      if (!confirmed)
          return;
      setLoading(true);
      await creditMemoApis.deleteCreditMemo(creditMemoId); // API call to delete the credit memo
      toast.success('Credit memo deleted successfully');
      loadCreditMemos(); // Reload the credit memos after deletion
    } catch (error) {
      console.error('Error deleting credit memo:', error);
      toast.error('Failed to delete credit memo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (memo: CreditMemoForm) => {
    setEditMode(true);
    if (typeof memo.dealer === 'object' && 'companyName' in memo.dealer) {
      setSelectedDealer(memo.dealer as ApprovedDealer);
    } else {
      setSelectedDealer(null);
    }
    setSelectedCreditMemo(memo);
    setFormState({
      amount: memo.amount,
      reason: memo.reason,
      status: memo.status,
    });
    setShowForm(true);
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

        <div className="mb-6 flex justify-center sm:justify-start text-black">
          <Button color={'dark'} className='flex items-center' onClick={() => setShowForm(!showForm)}>
            <FaPlus className="mr-2 h-4 w-4 mt-0.5" /> {showForm ? 'Hide Form' : editMode ? 'Edit Credit Memo' : 'New Credit Memo'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select
                    name="status"
                    value={formState.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="REDEEMED">REDEEMED</option>
                  </Select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
              >
                {loading ? 'Processing...' : editMode ? 'Update Credit Memo' : 'Create Credit Memo'}
              </button>
            </form>
          </div>
        )}

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
              placeholder="Search by Customer"
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
              <option value="PENDING">PENDING</option>
              <option value="REDEEMED">REDEEMED</option>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="xl" />
            </div>
          ) : (
            <Table>
              <Table.Head>
              <Table.HeadCell>Actions</Table.HeadCell>
                <Table.HeadCell>ID</Table.HeadCell>
                <Table.HeadCell>Customer Name</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
                <Table.HeadCell>Reason</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredCreditMemos.map((memo) => (
                  <Table.Row key={memo.creditMemoId} className="bg-white">
                      <Table.Cell className='flex'>
                      <Button
                        color="warning"
                        size="xs"
                        onClick={() => handleEdit(memo)}
                        className="mr-2"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </Button>
                      <Button
                        color="failure"
                        size="xs"
                        onClick={() => handleDelete(memo.creditMemoId)}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </Button>
                    </Table.Cell>
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
