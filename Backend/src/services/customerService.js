const Customer = require("../config/models/customerModel");
const createCustomer = async (customerData) => {
    try {
        const customer = new Customer(customerData);
        await customer.save();
        return customer;
    } catch (error) {
        throw new Error('Error creating customer: ' + error.message);
    }
};

const getCustomers = async () => {
    try {
        const customers = await Customer.find().populate('customerCategory');
        return customers;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching customers: ' + error.message);
    }
};

const getCustomerById = async (id) => {
    try {
        const customer = await Customer.findById(id).populate('customerCategory');
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching customer by id: ' + error.message);
    }
};

const updateCustomer = async (id, customerData) => {
    try {
        const customer = await Customer.findByIdAndUpdate(id, customerData, { new: true });
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    } catch (error) {
        throw new Error('Error updating customer: ' + error.message);
    }
};

const deleteCustomer = async (id) => {
    try {
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    } catch (error) {
        throw new Error('Error deleting customer: ' + error.message);
    }
};

const activateCustomer = async (id) => {
    try {
        const customer = await Customer.findByIdAndUpdate(id, { isActive: true }, { new: true });
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    } catch (error) {
        throw new Error('Error activating customer: ' + error.message);
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