const Agent = require('../config/models/agentModel');

const createAgent = async (agentData) => {
    const agent = new Agent(agentData);
    return await agent.save();
};

const getAgents = async (filter = {}) => { return await Agent.find(filter) };

const getAgentById = async (id) => { return await Agent.findById(id).populate('linkedOrders') };

const updateAgentById = async (id, updateData) => { return await Agent.findByIdAndUpdate(id, updateData, { new: true }) };

const deleteAgentById = async (id) => { return await Agent.findByIdAndUpdate(id, { status: 'DELETED' }, { new: true }) };

module.exports = {
    createAgent,
    getAgents,
    getAgentById,
    updateAgentById,
    deleteAgentById,
};
