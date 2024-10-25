import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { CustomerCategory } from '../../config/models/cutomercategory';
import { customerCategoryApi } from '../../config/apiRoutes/customerCategoryApi'; 

export default function AddCustomerCategory() {
    const [formState, setFormState] = useState<CustomerCategory>({
        customercategoryId: '',
        customercategoryName: '',
        customercategoryDescription: '',
    });

    const [loading, setLoading] = useState(false); 

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await customerCategoryApi.createCustomercateory(formState); 
            if (response.status === 201) { 
                toast.success('Customer category added successfully');
              
                setFormState({
                    customercategoryId: '',
                    customercategoryName: '',
                    customercategoryDescription: '',
                });
            }
        } catch (error) {
            toast.error('Failed to add customer category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Add Customer Category</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Create a new category for customers.
                </p>
            </div>
    
            <div className="bg-white shadow-lg rounded-lg p-8 transition duration-300 ease-in-out transform hover:scale-105">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
                            <input
                                type="text"
                                name="customercategoryId"
                                value={formState.customercategoryId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Category ID"
                            />
                        </div>
    
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                name="customercategoryName"
                                value={formState.customercategoryName}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Category Name"
                            />
                        </div>
    
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="customercategoryDescription"
                                value={formState.customercategoryDescription}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Description"
                                rows={4}
                            />
                        </div>
                    </div>
    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
                    >
                        {loading ? 'Processing...' : 'Create Category'}
                    </button>
                </form>
            </div>
        </div>
    </div>
    
    );
}
