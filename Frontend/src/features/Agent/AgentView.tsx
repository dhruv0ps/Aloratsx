import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentApis } from '../../config/apiRoutes/agentApi';
import { AgentWithData } from '../../config/models/agent';
import { OrderWithData } from '../../config/models/order';
import Loading from '../../util/Loading';
import { Button, Table } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa';

interface AgentViewData extends AgentWithData {
    linkedOrders: OrderWithData[];
    totalCommission: number;
    totalOrderAmount: number;
}

export default function AgentView() {
    const [agentData, setAgentData] = useState<AgentViewData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const response = await agentApis.getAgentById(id!);
                const coms = calculateTotalCommission(response.data)
                setAgentData({ ...response.data, totalCommission: coms.com, totalOrderAmount: coms.order });

            } catch (error) {
                console.error("Error fetching agent data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [id]);

    const calculateTotalCommission = (agentData: AgentViewData) => {
        if (!agentData) return { com: 0, order: 0 };
        return agentData.linkedOrders.reduce((acc, curr) => {
            return { com: acc.com + (curr.grandTotal * agentData.commission) / 100, order: curr.grandTotal + acc.order }
        }, { com: 0, order: 0 });
    };
    const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 -mt-5 border border-gray-100 border-l-2">
            <div className="max-w-6xl mx-auto">
                <Button
                    outline
                    onClick={() => navigate(-1)}
                    color="light"
                    className=" flex items-center border-gray-100 text-gray-600 hover:text-gray-900"
                >
                    <FaChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Agent Details
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View details and configurations of the agent
                    </p>
                </div>

                {agentData ? <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <InfoItem label="Name" value={agentData?.name} />
                        <InfoItem label="Email" value={agentData?.email} />
                        <InfoItem label="Mobile" value={agentData?.number} />
                        <InfoItem label="Commission Rate" value={`${agentData?.commission}%`} />
                        <InfoItem label="Total Commission" value={`$${agentData?.totalCommission?.toFixed(2) || '0.00'}`} />
                        <InfoItem label="Total Order Amount" value={`$${agentData?.totalOrderAmount?.toFixed(2) || '0.00'}`} />
                    </div>

                    <div className='shadow-md p-5 mt-8'>
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            Orders
                        </h5>
                        {agentData.linkedOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table hoverable>
                                    <Table.Head>
                                        <Table.HeadCell>Order ID</Table.HeadCell>
                                        <Table.HeadCell>Date</Table.HeadCell>
                                        <Table.HeadCell>Order Amount</Table.HeadCell>
                                        <Table.HeadCell>Commission Amount</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {agentData.linkedOrders.map((order) => (
                                            <Table.Row key={order._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                                    {order.purchaseOrderNumber}
                                                </Table.Cell>
                                                <Table.Cell>{new Date(order.createdAt).toLocaleDateString()}</Table.Cell>
                                                <Table.Cell>${order.grandTotal.toFixed(2)}</Table.Cell>
                                                <Table.Cell>
                                                    ${((order.grandTotal * agentData.commission) / 100).toFixed(2)}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        ) : (
                            <p className='text-gray-500 text-center py-8'>No linked orders found.</p>
                        )}
                    </div>
                </> : <p className='text-gray-500 mt-32 text-center'>Agent not found</p>}
            </div>
        </div>
    );
}