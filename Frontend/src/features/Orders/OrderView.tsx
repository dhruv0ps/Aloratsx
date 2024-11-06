import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import { orderApis } from '../../config/apiRoutes/orderRoutes';
import { OrderWithData } from '../../config/models/order';
import { FaBox, FaFileInvoice, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { logApi } from '../../config/apiRoutes/logsRoutes';
import { Button, Modal, Table } from 'flowbite-react';
import showConfirmationModal from '../../util/confirmationUtil';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<OrderWithData[]>([]);
    const [sortedOrders, setSortedOrders] = useState<OrderWithData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'recent' | 'az' | 'za'>('recent');
    const [selectedOrder, setSelectedOrder] = useState<OrderWithData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            const filtered = orders.filter((order) =>
                order.dealer?.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const sorted = [...filtered].sort((a, b) => {
                if (sortOption === 'recent') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                } else if (sortOption === 'az') {
                    return (a.dealer?.contactPersonName || '').localeCompare(b.dealer?.contactPersonName || '');
                } else {
                    return (b.dealer?.contactPersonName || '').localeCompare(a.dealer?.contactPersonName || '');
                }
            });

            setSortedOrders(sorted);
        }
    }, [orders, sortOption, searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApis.getAllApprovedOrders();
            if (response.status) {
                setOrders(response.data);
            } else {
                toast.error('Failed to load orders');
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (order: any) => {
        const confirmDelete = await showConfirmationModal('Are you sure you want to delete this order?');
        if (confirmDelete) {
            try {
                await orderApis.updateOrder(order._id, { status: "DELETED" });
                toast.success('Order deleted successfully');
                let logData = {
                    operation: "Order",
                    details: {
                        dealer: order._id,
                        operation: "Delete Order"
                    },
                    message: 'Order deleted successfully'
                };
                await logApi.addLogs(logData);
                fetchOrders();
            } catch (error) {
                console.error('Failed to delete order', error);
                toast.error('Failed to delete order');
            }
        }
    };

    const openModal = (order: OrderWithData) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Pagination logic
    const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
    const currentOrders = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen border-l border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mt-5">
            <button
                onClick={() => navigate(-1)}
                className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
            >
                <FaChevronLeft className="w-5 h-5 mr-2" />
                Back
            </button>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Management</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage all your orders in one place.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex gap-6 justify-between items-center mb-6">
                        <input
                            type="text"
                            placeholder="Search by Customer name or order ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                        />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as 'recent' | 'az' | 'za')}
                            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                        >
                            <option value="recent">Sort by Recent Date</option>
                            <option value="az">Sort A-Z</option>
                            <option value="za">Sort Z-A</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Customer Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Customer Company Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Order Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Invoice Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black bg-gray-300 uppercase tracking-wider">Created At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center flex items-center gap-x-2">
                                            <Button color="dark" size="sm" onClick={() => openModal(order)}>View</Button>
                                            {order.status !== "DELETED" && (
                                                <Button
                                                    color="failure"
                                                    size="sm"
                                                    outline
                                                    onClick={() => handleDelete(order)}
                                                    disabled={order.invoiceStatus === 'Invoiced'}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.purchaseOrderNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.dealer?.contactPersonName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.dealer?.companyName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'REJECTED'
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : order.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.invoiceStatus ?? "Pending"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center mt-4">
                        <Button
                            color="gray"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="mr-2"
                        >
                            Previous 
                        </Button>
                        <span className="text-sm text-gray-600 mt-2 ml-2 mr-2 ">Page {currentPage} of {totalPages}</span>
                        <Button
                            color="gray"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="ml-2"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="3xl">
                <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
                    <h3 className="text-xl font-semibold text-gray-700">Order Details</h3>
                </Modal.Header>
                <Modal.Body className="!p-6">
                    {selectedOrder && (
                        <div className="space-y-6 text-gray-500">
                            {/* Order Details */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-semibold flex items-center mb-4">
                                        <FaFileInvoice className="mr-2" /> Order Status
                                    </h4>
                                    <p><span className="font-semibold">Order ID:</span> {selectedOrder.purchaseOrderNumber}</p>
                                    <p><span className="font-semibold">Order Status:</span> {selectedOrder.status}</p>
                                    <p><span className="font-semibold">Invoice Status:</span> {selectedOrder.invoiceStatus || 'Pending'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="text-lg">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-lg font-semibold flex items-center mb-4">
                                        <FaUser className="mr-2" /> Customer Information
                                    </h4>
                                    <p><span className="font-semibold">Name:</span> {selectedOrder.dealer.contactPersonName}</p>
                                    <p><span className="font-semibold">Company:</span> {selectedOrder.dealer.companyName}</p>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-lg font-semibold flex items-center justify-end mb-4">
                                        <FaMapMarkerAlt className="mr-2" /> Billing Address
                                    </h4>
                                    <p>{selectedOrder.billTo.companyName}</p>
                                    <p>{selectedOrder.billTo.address.address}</p>
                                </div>
                            </div>

                            {/* Product Details */}
                           {/* Product Details */}
<div className="overflow-x-auto">
    <h4 className="text-lg font-semibold flex items-center mb-4">
        <FaBox className="mr-2" /> Products
    </h4>
    <Table>
        <Table.Head>
            <Table.HeadCell>Product Name</Table.HeadCell>
            {/* <Table.HeadCell>Product SKU</Table.HeadCell> */}
            <Table.HeadCell>Child SKU</Table.HeadCell>
            <Table.HeadCell>Child Name</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
        </Table.Head>
        <Table.Body>
            {selectedOrder.products.map((product, index) => {
                // Find the child in `children` that matches the `childSKU`
                const matchingChild = product.product.children.find(child => child.SKU === product.childSKU);

                return (
                    <Table.Row key={index}>
                        <Table.Cell>{product.product.name}-{matchingChild ? matchingChild.name : 'N/A'}</Table.Cell>
                        
                        <Table.Cell>{product.childSKU}</Table.Cell>
                        <Table.Cell>{matchingChild ? matchingChild.name : 'N/A'}</Table.Cell>
                        <Table.Cell>{product.quantity}</Table.Cell>
                        <Table.Cell>${product.price.toFixed(2)}</Table.Cell>
                        <Table.Cell>${(product.quantity * product.price).toFixed(2)}</Table.Cell>
                    </Table.Row>
                );
            })}
        </Table.Body>
    </Table>
    <div className="flex justify-end mt-4">
        <div>
            <p>GST: ${selectedOrder.gst}</p>
            <p>HST: ${selectedOrder.hst}</p>
            <p>QST: ${selectedOrder.qst}</p>
            <p>PST: ${selectedOrder.pst}</p>
            <p className="text-lg font-semibold">Grand Total: ${selectedOrder.grandTotal.toFixed(2)}</p>
        </div>
    </div>
</div>

                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setIsModalOpen(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Orders;
