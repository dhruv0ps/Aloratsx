import { useEffect, useState } from 'react';
import { Button, Table, Modal } from 'flowbite-react';
import Loading from '../../util/Loading';
import { orderApis } from '../../config/apiRoutes/orderRoutes';
import { toast } from 'react-toastify';
import { OrderWithData } from '../../config/models/order';
import { useStore } from '../../store/useStore';
import showConfirmationModal from '../../util/confirmationUtil';
import { logApi } from '../../config/apiRoutes/logsRoutes';

const OrderApprovalList = () => {
    const [orders, setOrders] = useState<OrderWithData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { authStore } = useStore();
    const { user } = authStore
    let role = user?.role?.toLowerCase()

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const handleApprove = async (orderId: string, phase: string) => {
        try {
            const confirmed = await showConfirmationModal("The order phase cannot change once finalized. Are you sure you would like to continue?")
            if (!confirmed)
                return;
            let res = await orderApis.updateOrder(orderId, { phase })
            if (res.status)
                toast.success(`Order request ${phase} successfully.`)
            let logData={
                operation:"Order",
                details:{
                    dealer:orderId,
                    operation:"Update Order"
                },
                message: `Order request ${phase} successfully.`
            }
            await logApi.addLogs(logData)
        } catch (error) {
            console.log("oh well. oops.")
        }
        await fetchPendingOrders()
    };

    const fetchPendingOrders = async () => {
        setLoading(true);
        try {
            const response = await orderApis.getAllPendingOrders()
            if (response.status)
                setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch pending orders', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (order: OrderWithData) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Pending Order Approvals</h2>
            <Table hoverable>
                <Table.Head>
                {role === "admin" && <Table.HeadCell className='text-center'>Actions</Table.HeadCell>}
                    <Table.HeadCell>Dealer Name</Table.HeadCell>
                    <Table.HeadCell>Company Name</Table.HeadCell>
                    <Table.HeadCell>PO Number</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Grand Total</Table.HeadCell>
                    
                </Table.Head>
                <Table.Body className="divide-y">
                    {orders.map((order) => (
                        <Table.Row
                            key={order._id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer hover:bg-gray-50"
                            onClick={() => openModal(order)}
                        >
                            {role === "admin" && <Table.Cell>
                                <div className="flex space-x-2 justify-center">
                                    <Button color="success" size="sm" onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); handleApprove(order._id, 'approved'); }}>
                                        Approve
                                    </Button>
                                    <Button color="failure" size="sm" onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); handleApprove(order._id, 'rejected'); }}>
                                        Reject
                                    </Button>
                                </div>
                            </Table.Cell>}
                            <Table.Cell>{order.dealer?.contactPersonName}</Table.Cell>
                            <Table.Cell>{order.dealer?.companyName}</Table.Cell>
                            <Table.Cell>{order.purchaseOrderNumber}</Table.Cell>
                            <Table.Cell>{new Date(order.date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>${order.grandTotal.toFixed(2)}</Table.Cell>
                            
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
                <Modal.Header>
                    Order Details
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Dealer Information</h3>
                                <p>Name: {selectedOrder.dealer.contactPersonName}</p>
                                <p>Company: {selectedOrder.dealer.companyName}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Order Information</h3>
                                <p>PO Number: {selectedOrder.purchaseOrderNumber}</p>
                                <p>Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
                                <p>Grand Total: ${selectedOrder.grandTotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Products</h3>
                                <ul className="list-disc pl-5">
                                    {selectedOrder.products.map((product, index) => (
                                        <li key={index}>
                                            {product.product.name} - Quantity: {product.quantity}, Price: ${product.price.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Billing Address</h3>
                                <p>{selectedOrder.billTo.companyName}</p>
                                <p>{selectedOrder.billTo.address.address}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderApprovalList;