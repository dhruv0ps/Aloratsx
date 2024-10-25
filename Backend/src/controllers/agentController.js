const agentService = require('../services/agentService');

const createAgent = async (req, res) => {
    try {
        const agent = await agentService.createAgent(req.body);
        res.status(201).json({ status: true, data: agent, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

const getAgents = async (req, res) => {
    try {
        const agents = await agentService.getAgents(req.query);
        res.json({ status: true, data: agents, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

const getAgentById = async (req, res) => {
    try {
        const agent = await agentService.getAgentById(req.params.id);
        if (agent) {
            res.json({ status: true, data: agent, err: {} });
        } else {
            res.status(404).json({ message: 'Agent not found' });
        }
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

const updateAgentById = async (req, res) => {
    try {
        const updatedAgent = await agentService.updateAgentById(req.params.id, req.body);
        res.json({ status: true, data: updatedAgent, err: {} });
    } catch (error) {
        res.status(400).json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    createAgent,
    getAgents,
    getAgentById,
    updateAgentById,
};
