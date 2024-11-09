const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body);
        return res.json({ status: true, data: order, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await orderService.updateOrder(id, req.body);
        return res.json({ status: true, data: order, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getPendingOrders = async (req, res) => {
    try {
        const orders = await orderService.getPendingOrders();
        return res.json({ status: true, data: orders, err: {} });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getApprovedOrders = async (req, res) => {
    try {
        const orders = await orderService.getApprovedOrders();
        return res.json({ status: true, data: orders, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await orderService.getOrderById(id);
        return res.json({ status: true, data: order, err: {} });
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getOrderByDealerId = async (req, res) => {
    const { id } = req.body;
    try {
        const order = await orderService.getAllOrderbyDealer(id);
        return res.json({ status: true, data: order});
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getOrderByOrderNUmbr = async (req, res) => {
    const { OrderNumber } = req.body;
    try {
        const order = await orderService.getOrderbyPOnumber(OrderNumber);
        return res.json({ status: true, data: order});
    } catch (error) {
        return res.json({ status: false, data: {}, err: error.message });
    }
};

const getAllOrder = async (req,res) => {
        try{
            const order = await orderService.getAllOrder();
            return res.json({status : true ,data : order});
        }
        catch (error) {
            console.log(error)
            return res.json({ status: false, data: {}, err: error.message });
        }
}

const getOrdersToday = async (req,res) => {
    try{
        const order = await orderService.getOrdersToday();
        return res.json({status : true ,data : order});
    }

    catch (error) {
        console.log(error)
        return res.json({ status: false, data: {}, err: error.message });
    }
}

module.exports = {
    createOrder,
    updateOrder,
    getPendingOrders,
    getApprovedOrders,
    getOrderById,
    getOrderByDealerId,
    getOrderByOrderNUmbr,
    getAllOrder,getOrdersToday
}