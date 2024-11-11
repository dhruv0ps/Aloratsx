import { useEffect, useState } from 'react';
import { agentApis } from '../../config/apiRoutes/agentApi';
import { AgentWithData } from '../../config/models/agent';
import Loading from '../../util/Loading';
import { Table, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaTrash, FaEye, FaUndo, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AgentList() {
    const [agents, setAgents] = useState<AgentWithData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [agentsPerPage] = useState(10); // Number of agents to display per page
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await agentApis.getAllAgents();
            setAgents(response.data);
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const indexOfLastAgent = currentPage * agentsPerPage;
    const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
    const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);

    const totalPages = Math.ceil(agents.length / agentsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleEdit = (agentId: string) => {
        navigate(`/yellowadmin/agents/edit/${agentId}`);
    };

    const handleDelete = async (agentId: string, status: string) => {
        try {
            await agentApis.updateAgent(agentId, { status });
            toast.success("Agent status updated successfully");
            fetchAgents();
        } catch (error) {
            console.error("Error updating agent status:", error);
            toast.error("Failed to update agent status");
        }
    };

    const handleView = (agentId: string) => {
        navigate(`/yellowadmin/agent/view/${agentId}`);
    };

    return (
        <div className="min-h-[calc(100vh-4.5rem)] border-l border-gray-200 bg-gray-50 -mt-5 py-12 px-4 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate(-1)}
                className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
            >
                <FaChevronLeft className="w-5 h-5 mr-2" />
                Back
            </button>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Agents List
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        View and manage our network of trusted agents.
                    </p>
                </div>

                {loading ? (
                    <Loading />
                ) : agents.length === 0 ? (
                    <p className="text-center text-gray-600">No agents found.</p>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
                        <Table className="w-full" striped>
                            <Table.Head>
                            <Table.HeadCell className='text-center'>Actions</Table.HeadCell>
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>Number</Table.HeadCell>
                                <Table.HeadCell>Commission (%)</Table.HeadCell>
                                <Table.HeadCell>Email</Table.HeadCell>
                                <Table.HeadCell>Status</Table.HeadCell>
                                
                            </Table.Head>
                            <Table.Body>
                                {currentAgents.map((agent, index) => (
                                    <Table.Row key={index} className="border-t border-gray-200">
                                         <Table.Cell>
                                            <div className="flex space-x-2 items-end justify-center">
                                                <Button className='flex items-end' size="sm" color="dark" onClick={() => handleView(agent._id)}>
                                                    <FaEye /> 
                                                </Button>
                                                <Button className='flex items-end' size="sm" color="warning" onClick={() => handleEdit(agent._id)}>
                                                    <FaEdit  /> 
                                                </Button>
                                                {agent.status === "ACTIVE" ? (
                                                    <Button className='flex items-end' size="sm" color="failure" onClick={() => handleDelete(agent._id, "DELETED")}>
                                                        <FaTrash  /> 
                                                    </Button>
                                                ) : (
                                                    <Button className='flex items-end' size="sm" color="success" onClick={() => handleDelete(agent._id, "ACTIVE")}>
                                                        <FaUndo  /> 
                                                    </Button>
                                                )}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>{agent.name}</Table.Cell>
                                        <Table.Cell>{agent.number}</Table.Cell>
                                        <Table.Cell>{agent.commission}</Table.Cell>
                                        <Table.Cell>{agent.email}</Table.Cell>
                                        <Table.Cell>
                                            {agent.status === 'ACTIVE' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    Deleted
                                                </span>
                                            )}
                                        </Table.Cell>
                                       
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                size="sm"
                                color="light"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <p className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </p>
                            <Button
                                size="sm"
                                color="light"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
