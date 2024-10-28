import { useEffect, useState } from 'react';
import { customerApi } from '../../config/apiRoutes/customerApi';
import { BaseCustomer } from '../../config/models/customer';
import Loading from '../../util/Loading';
import { Table, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaTrash, FaUndo, FaEdit,FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import showConfirmationModal from '../../util/confirmationUtil';

export default function CustomerList() {
    const [customers, setCustomers] = useState<BaseCustomer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customerApi.getCustomers();
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customerId: string) => {
        navigate(`/customers/edit/${customerId}`);
    };

    const handleChangeStatus = async (customerId: string, newStatus: string) => {
        try {
            await customerApi.updateCustomer(customerId, { isActive: newStatus === "ACTIVE" });
            toast.success(newStatus === "ACTIVE" ? "Customer successfully activated" : "Customer successfully deactivated");
            fetchCustomers();
        } catch (error) {
            console.error("Error updating customer status:", error);
            toast.error("Failed to update customer status");
        }
    };

    const handleDelete = async (customerId: string) => {
        const confirm = await showConfirmationModal('Are you sure you want to permanently delete this customer? This action cannot be undone.');
        if (!confirm) return;

        try {
            await customerApi.deleteCustomer(customerId);
            toast.success("Customer successfully deleted");
            fetchCustomers();
        } catch (error) {
            console.error("Error deleting customer:", error);
            toast.error("Failed to delete customer");
        }
    };
const handleCreateCustomer = () => {
    navigate("/yellowadmin/customer/add")
}
    return (
        <div className="min-h-[calc(100vh-4.5rem)] border-l border-gray-200 bg-gray-50 -mt-5 py-12 px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between items-center mb-5">
     
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

    
      <Button
       color='green'
      
        onClick={handleCreateCustomer}
      >
        <FaPlus className="mr-2 mt-1" /> Add Customer
      </Button>
    </div>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Customers List</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage our customers.
                    </p>
                </div>

                {loading ? (
                    <Loading />
                ) : customers.length === 0 ? (
                    <p className="text-center text-gray-600">No customers found.</p>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
                        <Table className="w-full" striped>
                            <Table.Head>
                                <Table.HeadCell>First Name</Table.HeadCell>
                                <Table.HeadCell>Last Name</Table.HeadCell>
                                <Table.HeadCell>Phone Number</Table.HeadCell>
                                <Table.HeadCell>Email</Table.HeadCell>
                                <Table.HeadCell>Business Name</Table.HeadCell>
                                <Table.HeadCell>Status</Table.HeadCell>
                                <Table.HeadCell className='text-center'>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {customers.map((customer, index) => (
                                    <Table.Row key={index} className="border-t border-gray-200">
                                        <Table.Cell>{customer.firstName}</Table.Cell>
                                        <Table.Cell>{customer.lastName}</Table.Cell>
                                        <Table.Cell>{customer.phoneNumber || customer.cell}</Table.Cell>
                                        <Table.Cell>{customer.emailId}</Table.Cell>
                                        <Table.Cell>{customer.businessName}</Table.Cell>
                                        <Table.Cell>
                                            {customer.isActive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex space-x-2 items-end justify-center">
                                                <Button className='flex items-end' size="sm" color="warning" onClick={() => handleEdit(customer._id!)}>
                                                    <FaEdit className="mr-2 mt-0.5" /> <p>Edit</p>
                                                </Button>
                                                {customer.isActive ? (
                                                    <Button className='flex items-end' size="sm" color="failure" onClick={() => handleChangeStatus(customer._id!, "DEACTIVATED")}>
                                                        <FaTrash className="mr-2 mt-0.5" /> <p>Deactivate</p>
                                                    </Button>
                                                ) : (
                                                    <Button className='flex items-end' size="sm" color="success" onClick={() => handleChangeStatus(customer._id!, "ACTIVE")}>
                                                        <FaUndo className="mr-2 mt-0.5" /> <p>Activate</p>
                                                    </Button>
                                                )}
                                                <Button className='flex items-end' size="sm" color="failure" onClick={() => handleDelete(customer._id!)}>
                                                    <FaTrash className="mr-2 mt-0.5" /> <p>Delete</p>
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
