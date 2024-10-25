import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { BaseCustomer, Address } from '../../config/models/customer';
import { customerApi } from '../../config/apiRoutes/customerApi';

import 'react-phone-input-2/lib/style.css';

const provinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
];

export default function AddCustomer() {
    const [formState, setFormState] = useState<BaseCustomer>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        cell: '',
        emailId: '',
        emailId2: '',
        businessName: '',
        customerCategory: '',
        addresses: [
            {
                unit: '',
                street: '',
                buzzCode: '',
                city: '',
                province: '',
                postalCode: '',
                isDefault: true,
            }
        ],
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
        const { name, value } = e.target;
        if (index !== undefined) {
            setFormState((prev) => {
                const updatedAddresses = [...prev.addresses];
                updatedAddresses[index] = {
                    ...updatedAddresses[index],
                    [name]: value
                };
                return { ...prev, addresses: updatedAddresses };
            });
        } else {
            setFormState((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePhoneChange = (value: string) => {
        setFormState((prev) => ({ ...prev, cell: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await customerApi.createCustomer(formState);
            if (res.status) {
                toast.success('New customer added successfully');
                navigate('/yellowadmin/customers');
            }
        } catch (error) {
            toast.error('Failed to add customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate(-1)}
                  className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
            >
                <FaChevronLeft className="w-5 h-5 mr-2" />
                Back
            </button>

            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Management</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Add and manage customers efficiently.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formState.firstName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="First name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formState.lastName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Last name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cell</label>
                                <input
                                    type="text"
                                    name="cell"
                                    value={formState.cell}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Cell number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formState.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="emailId"
                                    value={formState.emailId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Email</label>
                                <input
                                    type="email"
                                    name="emailId2"
                                    value={formState.emailId2}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Alternate email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formState.businessName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Business name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Category</label>
                                <input
                                    type="text"
                                    name="customerCategory"
                                    value={formState.customerCategory}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    placeholder="Customer category"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Address Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formState.addresses[0].unit}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                        placeholder="Unit number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Buzz Code</label>
                                    <input
                                        type="text"
                                        name="buzzCode"
                                        value={formState.addresses[0].buzzCode}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                        placeholder="Buzz code (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formState.addresses[0].street}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formState.addresses[0].city}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                        placeholder="City"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                                    <select
                                        name="province"
                                        value={formState.addresses[0].province}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map((province) => (
                                            <option key={province} value={province}>
                                                {province}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formState.addresses[0].postalCode}
                                        onChange={(e) => handleInputChange(e, 0)}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                        placeholder="Postal code"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
                        >
                            {loading ? 'Processing...' : 'Create Customer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
