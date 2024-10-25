const Log = require('../config/models/logModel');

const addLog = async (logData, session) => {
    const { operation, details, message } = logData;
    const newLog = new Log({
        operation,
        details,
        message
    });

    return await newLog.save({ session });
};
const getAllLogs = async (page = 1, limit = 20, filters = {}) => {
    const skip = (page - 1) * limit;

    let query = {};

    if (filters.operation) {
        query.operation = filters.operation;
    }
    if (filters.detail) {
        query['$or'] = [
            { 'details.child': { $regex: filters.detail, $options: 'i' } },
            { 'details.order_id': { $regex: filters.detail, $options: 'i' } },
            { 'details.routeId': { $regex: filters.detail, $options: 'i' } }
        ];
    }

    const logs = await Log.find(query)
        // .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Log.countDocuments(query);
    // console.log(total, limit, total / limit)
    return {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    };
};


module.exports = {
    addLog,
    getAllLogs,
};
