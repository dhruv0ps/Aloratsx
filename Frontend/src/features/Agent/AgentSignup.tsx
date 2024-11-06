import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { BaseAgent } from '../../config/models/agent';
import { agentApis } from '../../config/apiRoutes/agentApi';

export default function AddOrEditAgent() {
    const [formState, setFormState] = useState<BaseAgent>({
        name: '',
        number: '',
        commission: 0,
        email: '',
        status: 'ACTIVE',
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get the agent ID from the route params
    const isEditMode = Boolean(id); // Determine if we are in edit mode

    useEffect(() => {
        if (isEditMode && id) {
            loadAgentData(id); // Pass the id as an argument
        }
    }, [id]);

    const loadAgentData = async (id: string) => {
        try {
            setLoading(true);
            const res = await agentApis.getAgentById(id);
            if (res.data) {
                setFormState(res.data); // Populate form state with the agent data
            }
        } catch (error) {
            toast.error('Failed to load agent data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: name === 'commission' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode && id) {
                // Update existing agent
                const res = await agentApis.updateAgent(id, formState);
                if (res.status) {
                    toast.success('Agent updated successfully');
                }
            } else {
                // Create new agent
                const res = await agentApis.createAgent(formState);
                if (res.status) {
                    toast.success('New agent added successfully');
                }
            }
            navigate('/yellowadmin/agents');
        } catch (error) {
            toast.error('Failed to save agent');
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
                        {isEditMode ? 'Edit Agent' : 'Agent Management'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {isEditMode ? 'Update agent details' : 'Create and manage agents efficiently.'}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 ">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Agent name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number
                                </label>
                                <input
                                    type="tel"
                                    name="number"
                                    value={formState.number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Commission (%)
                                </label>
                                <input
                                    type="number"
                                    name="commission"
                                    value={formState.commission}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Commission percentage"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Agent email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
                        >
                            {loading ? 'Processing...' : isEditMode ? 'Update Agent' : 'Create Agent'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
