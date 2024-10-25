const logService = require('../services/logService');


const addLog = async (req, res) => {
    try {
        const logData = req.body;
        const log = await logService.addLog(logData);
        res.status(201).json({ message: 'Log added successfully', log });
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
};

const getAllLogs = async (req, res) => {
    try {
        const { page, limit, category, operation, detail } = req.body;
        const filters = { category, operation, detail };
        const logs = await logService.getAllLogs(parseInt(page), parseInt(limit), filters);
        res.status(200).json({ status: true, data: logs, err: {} });
    } catch (error) {
        res.status(500).json({ status: false, data: {}, err: error.message });
    }
};

module.exports = {
    getAllLogs,
    addLog
};
