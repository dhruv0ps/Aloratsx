import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { DealerForm } from '../../config/models/dealer';
import { dealerApis } from '../../config/apiRoutes/dealerRoutes';
import { customerCategoryApi } from '../../config/apiRoutes/customerCategoryApi';

type CustomerCategory = {
  _id: string;
  customercategoryName: string;
};

export default function AddDealer() {
  const [formState, setFormState] = useState<DealerForm>({
    username: '',
    email: '',
    mobile: '',
    designation: '',
    province: '',
    company: '',
    address: { longitude: "", latitude: "", address: "" },
    paidAmount: 0,
    totalBalance: 0,
    totalOpenBalance: 0,
    customercategory: "", // bind this to the dropdown value
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CustomerCategory[]>([]); // Store fetched categories
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile' && isNaN(Number(value))) return;

    setFormState((prev) => {
      if (name === 'unit' || name === 'buzz' || name === 'address') {
        return {
          ...prev,
          address: {
            ...prev.address,
            [name]: value,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  useEffect(() => {
    fetchCustomerCategories();
  }, []);

  const fetchCustomerCategories = async () => {
    try {
      const response = await customerCategoryApi.getCustomercategories();
      if (response.data) {
        setCategories(response.data); // Set the fetched categories
      }
    } catch (error) {
      console.error('Failed to fetch customer categories', error);
      toast.error('Failed to fetch customer categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.address?.address) {
      toast.error('Please select a valid address');
      return;
    }
    setLoading(true);
    try {
      let res = await dealerApis.createTempDealer(formState);
      if (res.status) {
        toast.success('New dealer added successfully');
        navigate('/dealer/approvals');
      }
    } catch (error) {
      console.log(error);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Exceptional Service For Our Customers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our network of trusted dealers and experience the highest standards of partnership and support.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formState.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Enter your full name"
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
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formState.mobile}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formState.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Your designation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formState.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formState.province}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  placeholder="Your province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Category
                </label>
                <select
                  name="customercategory"
                  value={formState.customercategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.customercategoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Address Details
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  name="unit"
                  placeholder="Unit Number"
                  value={formState.address?.unit || ''}
                  onChange={handleInputChange}
                />
                <input
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                  name="buzz"
                  placeholder="Buzz Code"
                  value={formState.address?.buzz || ''}
                  onChange={handleInputChange}
                />
              </div>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                name="address"
                placeholder="Full Address"
                value={formState.address?.address || ''}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
            >
              {loading ? 'Processing...' : 'Create Customer Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
