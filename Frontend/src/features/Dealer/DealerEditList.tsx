import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taxSlab } from '../../config/models/taxslab';
import { Dealer, FormDataApprovedDealer } from '../../config/models/dealer';
import { commonApis } from '../../config/apiRoutes/commonRoutes';
import { dealerApis } from '../../config/apiRoutes/dealerRoutes';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import { Button } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa6';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { customerCategoryApi } from '../../config/apiRoutes/customerCategoryApi';
interface FormErrors {
    [key: string]: string;
}

const DealerEditList: React.FC = () => {
    const { id, aid } = useParams<{ id?: string; aid?: string }>();
    const [formData, setFormData] = useState<FormDataApprovedDealer>({
        contactPersonName: '',
        contactPersonCell: '',
        contactPersonEmail: '',
        designation: '',
        companyName: '',
        address: {
            address: "",
            longitude: "",
            latitude: ""
        },
        province: '',
        priceDiscount: 0,
        emailId: '',
        password: '',
        creditDueDays: 0,
        creditDueAmount: 0,
        paidAmount: 0,
        totalBalance: 0,
        totalOpenBalance: 0,
        customercategory: '' // Added customercategory field
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [taxSlabs, setTaxSlabs] = useState<taxSlab[]>([]);
    const [customerCategories, setCustomerCategories] = useState<{ _id: string, customercategoryName: string }[]>([]); // Customer categories state
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTaxSlabs = async () => {
            setLoading(true);
            try {
                const response = await commonApis.getAllTaxSlabs();
                setTaxSlabs(response.data);
            } catch (err) {
                console.error('Failed to fetch tax slabs', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchCustomerCategories = async () => {
            try {
                const response = await customerCategoryApi.getCustomercategories();; // Assuming this API exists
                setCustomerCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch customer categories', err);
            }
        };

        fetchTaxSlabs();
        fetchCustomerCategories();
    }, []);

    useEffect(() => {
        const fetchDealerDetails = async () => {
            setLoading(true);
            try {
                if (aid) {
                    const response = await dealerApis.getApprovedDealerbyId(aid);
                    console.log(response)
                    setFormData({
                        ...response.data,
                        customercategory: response.data.customercategory?._id || "", // Ensure customercategory is populated
                    });
                } else if (id) {
                    const response = await dealerApis.getTempDealerbyId(id);
                    let data: Dealer = response.data;
                    console.log(response.data)
                    setFormData(prev => ({
                        ...prev,
                        contactPersonName: data.username,
                        contactPersonCell: data.mobile,
                        province: data.province._id ?? "",
                        emailId: data.email,
                        contactPersonEmail: data.email,
                        address: data.address,
                        designation: data.designation,
                        companyName: data.company,
                        customercategory: data.customercategory || "" // Ensure customercategory is handled
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch Customer details', err);
            } finally {
                setLoading(false);
            }
        };

        if (id || aid) {
            fetchDealerDetails();
        }
    }, [id, aid]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (
            [
                'contactPersonName',
                'contactPersonCell',
                'contactPersonEmail',
                'designation',
                'companyName',
                'priceDiscount',
                'emailId',
                'password',
                'creditDueDays',
                'creditDueAmount',
            ].includes(name) &&
            value.length > 24
        ) {
            return;
        }

        if ((name === 'creditDueAmount' || name === 'priceDiscount' || name === 'creditDueDays') && Number(value) < 0) {
            return;
        }

        setFormData(prev => {
            if (name === 'unit' || name === 'buzz' || name === "address") {
                return {
                    ...prev,
                    address: {
                        ...prev.address!,
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

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!formData.contactPersonName) newErrors.contactPersonName = 'Contact Person Name is required';
        if (!formData.contactPersonCell) newErrors.contactPersonCell = 'Contact Person Cell is required';
        if (!formData.contactPersonEmail) {
            newErrors.contactPersonEmail = 'Contact Person Email ID is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.contactPersonEmail)) {
            newErrors.contactPersonEmail = 'Email must be a valid email address';
        }
        return newErrors;
    };

    const handleSaveEdits = async () => {
        try {
            setLoading(true);
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            if (id) {
                const res = await dealerApis.createApprovedDealer({ ...formData, tempid: id });
                if (res.status) {
                    toast.success("Successfully approved Customer application.");
                    navigate('/dealer');
                }
            } else if (aid) {
                const res = await dealerApis.updateApprovedDealer(aid, formData);
                if (res.status) {
                    toast.success("Successfully updated Customer ls.");
                    navigate("/dealer")
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold ">Edit Customer Details</h2>
                <p></p>
            </div>
            {loading ? <Loading /> : <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300 mt-12">
                <form onSubmit={handleSaveEdits}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Province field */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="province">
                                <span className='text-red-500'>*</span>Select Province
                            </label>
                            <select
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                className={`w-full border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                required
                            >
                                <option value=""></option>
                                {taxSlabs.filter(t => t.status === "ACTIVE").map((slab) => (
                                    <option key={slab._id} value={slab._id}>
                                        {slab.name}
                                    </option>
                                ))}
                            </select>
                            {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
                        </div>

                        {/* Contact Person Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="contactPersonName">
                                <span className='text-red-500'>*</span>Contact Person Name
                            </label>
                            <input
                                type="text"
                                id="contactPersonName"
                                name="contactPersonName"
                                value={formData.contactPersonName}
                                onChange={handleChange}
                                className={`w-full border ${errors.contactPersonName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                maxLength={24}
                            />
                            {errors.contactPersonName && <p className="text-red-500 text-sm">{errors.contactPersonName}</p>}
                        </div>

                        {/* Customer Category */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="customercategory">
                                <span className='text-red-500'>*</span>Select Customer Category
                            </label>
                            <select
                                id="customercategory"
                                name="customercategory"
                                value={formData.customercategory}
                                onChange={handleChange}
                                className={`w-full border ${errors.customercategory ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                required
                            >
                                <option value="">Select a category</option>
                                {customerCategories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.customercategoryName}
                                    </option>
                                ))}
                            </select>
                            {errors.customercategory && <p className="text-red-500 text-sm">{errors.customercategory}</p>}
                        </div>
                        {/* Contact Person Cell */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="contactPersonCell">
                                <span className='text-red-500'>*</span> Contact Person Cell
                            </label>
                            <input
                                type="text"
                                id="contactPersonCell"
                                name="contactPersonCell"
                                value={formData.contactPersonCell}
                                onChange={handleChange}
                                className={`w-full border ${errors.contactPersonCell ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                maxLength={24}
                            />
                            {errors.contactPersonCell && <p className="text-red-500 text-sm">{errors.contactPersonCell}</p>}
                        </div>

                        {/* Contact Person Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="contactPersonEmail">
                                <span className='text-red-500'>*</span> Contact Person Email
                            </label>
                            <input
                                type="email"
                                id="contactPersonEmail"
                                name="contactPersonEmail"
                                value={formData.contactPersonEmail}
                                onChange={handleChange}
                                className={`w-full border ${errors.contactPersonEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                maxLength={24}
                            />
                            {errors.contactPersonEmail && <p className="text-red-500 text-sm">{errors.contactPersonEmail}</p>}
                        </div>

                        {/* Designation */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="designation">
                                <span className='text-red-500'>*</span>Designation
                            </label>
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className={`w-full border ${errors.designation ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                maxLength={24}
                            />
                            {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                        </div>

                        {/* Company Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="companyName">
                                <span className='text-red-500'>*</span>Company Name
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className={`w-full border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                maxLength={24}
                            />
                            {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                        </div>
                        <div className="mb-4 space-y-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address:</label>
                            <div className="flex gap-x-5 items-center w-full">
                                <input
                                    className='flex-[0.5] w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200'
                                    name="unit"
                                    placeholder='Unit'
                                    value={formData.address?.unit || ''}
                                    onChange={handleChange}
                                />
                                <input
                                    className='flex-[0.5] w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200'
                                    name="buzz"
                                    placeholder='Buzz Code'
                                    value={formData.address?.buzz || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* <AutoCompleteAddress onChange={handleAddressChange} /> */}
                            <input
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200'
                                name="address"
                                placeholder='address'
                                value={formData.address?.address || ''}
                                onChange={handleChange}
                            />
                            {formData.address?.address ? (
                                <p className='text-xs text-gray-500 my-2'>
                                    <b>Selected address :</b> {formData.address.address}
                                </p>
                            ) : null}
                        </div>
                        {/* Price Discount */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="priceDiscount">
                                Price Discount (%)
                            </label>
                            <input
                                type="number"
                                id="priceDiscount"
                                name="priceDiscount"
                                value={formData.priceDiscount}
                                onChange={handleChange}
                                className={`w-full border ${errors.priceDiscount ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                min={0}
                            />
                            {errors.priceDiscount && <p className="text-red-500 text-sm">{errors.priceDiscount}</p>}
                        </div>

                        {/* Email ID */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="emailId">
                                <span className='text-red-500'>*</span>Email ID
                            </label>
                            <input
                                type="email"
                                id="emailId"
                                name="emailId"
                                value={formData.emailId}
                                onChange={handleChange}
                                className={`w-full border ${errors.emailId ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                            />
                            {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId}</p>}
                        </div>

                        {/* Password */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium mb-2" htmlFor="password">
                                <span className='text-red-500'>*</span>Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 pr-10`}
                                    minLength={8}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <HiEyeOff className="text-gray-500" /> : <HiEye className="text-gray-500" />}
                                </div>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        {/* Credit Due Days */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="creditDueDays">
                                <span className='text-red-500'>*</span>Credit Due Days
                            </label>
                            <input
                                type="number"
                                id="creditDueDays"
                                name="creditDueDays"
                                value={formData.creditDueDays}
                                onChange={handleChange}
                                className={`w-full border ${errors.creditDueDays ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                min={0}
                            />
                            {errors.creditDueDays && <p className="text-red-500 text-sm">{errors.creditDueDays}</p>}
                        </div>

                        {/* Credit Due Amount */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="creditDueAmount">
                                <span className='text-red-500'>*</span> Credit Due Amount
                            </label>
                            <input
                                type="number"
                                id="creditDueAmount"
                                name="creditDueAmount"
                                value={formData.creditDueAmount}
                                onChange={handleChange}
                                className={`w-full border ${errors.creditDueAmount ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2`}
                                min={0}
                            />
                            {errors.creditDueAmount && <p className="text-red-500 text-sm">{errors.creditDueAmount}</p>}
                        </div>
                        {id ? <div>
                            <label className="block text-sm font-medium mb-2">
                                Paid Amount
                            </label>
                            <input
                                type="number"
                                name="paidAmount"
                                value={formData.paidAmount}
                                readOnly
                                disabled
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Enter paid amount"
                            />
                        </div> : <></>}

                        {/* <div>
                            <label className="block text-sm font-medium mb-2">
                                Total Balance
                            </label>
                            <input
                                type="number"
                                name="totalBalance"
                                value={formData.totalBalance}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Enter total balance"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Total Open Balance
                            </label>
                            <input
                                type="number"
                                name="totalOpenBalance"
                                value={formData.totalOpenBalance}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Enter total open balance"
                            />
                        </div> */}

                        {/* Save Button */}
                        <div className="col-span-2">
                            <button
                                type="submit"

                                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
                            >
                                SAVE EDITS
                            </button>
                        </div>
                    </div>
                </form>

            </div>}
        </div>
    );
};

export default DealerEditList;
