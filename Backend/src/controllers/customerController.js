const customerService = require('../services/customerService');

const createCustomer = async (req, res) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({ status: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error creating customer', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const customers = await customerService.getCustomers();
        res.status(200).json({ status: true, data: customers });
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: false, message: 'Error fetching customers', error: error.message });
    }
};

const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await customerService.getCustomerById(id);
        if (!customer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.status(200).json({ status: true, data: customer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error fetching customer', error: error.message });
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await customerService.updateCustomer(id, req.body);
        if (!customer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.status(200).json({ status: true, message: 'Customer updated successfully', data: customer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error updating customer', error: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await customerService.deleteCustomer(id);
        if (!customer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.status(200).json({ status: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error deleting customer', error: error.message });
    }
};

const activateCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await customerService.activateCustomer(id);
        if (!customer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.status(200).json({ status: true, message: 'Customer activated successfully', data: customer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error activating customer', error: error.message });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    activateCustomer
};