import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApis } from '../../config/apiRoutes/orderRoutes';
import Loading from '../../util/Loading';
import { FaChevronLeft } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import AutoCompleteDealerInput from '../../util/AutoCompleteDealer';
import AutocompleteProductInput from '../../util/AutoCompleteProductInput';
import { OrderFormState } from '../../config/models/order';
import { ApprovedDealer } from '../../config/models/dealer';
import { Child } from '../../config/models/Child';
import showConfirmationModal from '../../util/confirmationUtil';
import { logApi } from '../../config/apiRoutes/logsRoutes';
import AutocompleteAgent from '../../util/AutoCompleteAgent';
import { AgentWithData } from '../../config/models/agent';

const OrderForm = () => {
    const { id } = useParams<{ id: string }>();
    const [formState, setFormState] = useState<OrderFormState>({
        agent: null,
        dealer: '',
        purchaseOrderNumber: '',
        date: new Date().toISOString().split("T")[0],
        billTo: {
            companyName: '',
            address: { address: '', longitude: '', latitude: '' }
        },
        shipTo: {
            companyName: '',
            address: { address: '', longitude: '', latitude: '' }
        },
        products: [],
        totalBeforeTax: 0,
        gst: 0,
        hst: 0,
        qst: 0,
        pst: 0,
        transportation: 0,
        grandTotal: 0,
    });
    const [selectedDealer, setSelectedDealer] = useState<ApprovedDealer>()
    const [loading, setLoading] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        calculateTotals();
    }, [formState.products, formState.transportation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        if (name === 'date')
            value = new Date(value).toISOString().split("T")[0]

        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDealerChange = async (dealer: ApprovedDealer) => {
        if (formState.products.length > 0) {
            const confirmed = await showConfirmationModal("Selecting a new dealer will result in emptying the current cart. Are you sure u want to proceed?")
            if (!confirmed)
                return
        }
        setFormState(prevState => ({
            ...prevState,
            dealer: dealer._id,
            billTo: {
                companyName: dealer.companyName,
                address: dealer.address
            },
            products: []
        }));
        setSelectedDealer(dealer)
    };
    const handleAgentChange = async (agent: AgentWithData) => {
        setFormState(prevState => ({
            ...prevState,
            agent: agent,
        }));
    };
    const handleShippingMode = () => {
        setFormState(prevState => ({
            ...prevState,
            shipTo: prevState.billTo
        }));
    };

    const handleProductChange = (product: Child & { parentName: string, parent_id: string }) => {
        try {
            const productExists = formState.products.some(p => p.childSKU === product.SKU);
            if (productExists) return;
            let discount = 0
            if (selectedDealer)
                discount = selectedDealer.priceDiscount
            const newPrice = Number(product.selling_price) * Number(discount) / 100
            // console.log(newPrice)
            setFormState(prevState => ({
                ...prevState,
                products: [
                    ...prevState.products,
                    {
                        parent_id: product.parent_id,
                        parentName: product.parentName,
                        product: product.parent_id,
                        childName: product.name,
                        description: product.description,
                        childSKU: product.SKU,
                        quantity: 1,
                        price: product.selling_price - newPrice
                    }
                ]
            }));
            setInputValue('');
        } catch (error) {
            toast.error("Something went wrong while adding products.")
            console.log(error)
        }
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        setFormState(prevState => ({
            ...prevState,
            products: prevState.products.map((product, i) =>
                i === index ? { ...product, quantity } : product
            )
        }));
    };
    const setUnitPriceChange = (index: number, price: number) => {
        setFormState(prevState => ({
            ...prevState,
            products: prevState.products.map((product, i) =>
                i === index ? { ...product, price } : product
            )
        }));
    };


    const handleRemoveProduct = (index: number) => {
        setFormState(prevState => ({
            ...prevState,
            products: prevState.products.filter((_, i) => i !== index)
        }));
    };

    const calculateTotals = () => {
        let totalBeforeTax = formState.products.reduce((acc, product) => acc + Number(product.price * product.quantity), 0);
        totalBeforeTax += Number(formState.transportation);
        let hst = 0, gst = 0, qst = 0, pst = 0
        if (selectedDealer) {
            hst = totalBeforeTax * selectedDealer.province.hst / 100
            pst = totalBeforeTax * selectedDealer.province.pst / 100
            qst = totalBeforeTax * selectedDealer.province.qst / 100
            gst = totalBeforeTax * selectedDealer.province.gst / 100
        }
        const grandTotal = totalBeforeTax + hst + gst

        setFormState(prevState => ({
            ...prevState,
            totalBeforeTax,
            gst,
            hst,
            qst,
            pst,
            grandTotal
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.products.length < 1) {
            toast.info("Please add products first.");
            return;
        }
        setLoading(true);
        try {
            let res;
            if (id) {
                res = await orderApis.updateOrder(id, formState);
            } else {
                res = await orderApis.createOrderRequest({ ...formState, agent: formState.agent?._id, dealerName: selectedDealer?.contactPersonName });
            }
            if (res.status) {
                toast.success(`Order successfully ${id ? 'updated' : 'created'}.`);
                let logData = {
                    operation: "Order",
                    details: {
                        dealer: formState.dealer,
                        operation: `${id}?"Order Updated":"Order Created"`
                    },
                    message: id ? "Order updated Successfully" : "Order created Successfully"
                }
                await logApi.addLogs(logData)
                navigate(`/yellowadmin/orders/approvals`);
            }
        } catch (error: any) {
            toast.error(error.response.data.err ?? "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

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
                        {id ? 'Edit Order' : 'Create New Order'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Streamline your ordering process with our user-friendly form.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className=" flex-grow col-span-2">
                                <label htmlFor="dealer" className="block text-sm font-medium text-gray-700 mb-2"><span className='text-red-500'>*</span>Customer:</label>
                                <AutoCompleteDealerInput value={formState.dealer} onChange={handleDealerChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formState.date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agent
                                </label>
                                <AutocompleteAgent value={formState.agent} onSelect={handleAgentChange} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Bill To
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Company Name"
                                value={formState.billTo.companyName}
                                onChange={(e) => setFormState(prevState => ({
                                    ...prevState,
                                    billTo: { ...prevState.billTo, companyName: e.target.value }
                                }))}
                                required
                            />
                            <input
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Billing Address"
                                value={formState.billTo.address.address}
                                onChange={(e) => setFormState(prevState => ({
                                    ...prevState,
                                    billTo: { ...prevState.billTo, address: { address: e.target.value } }
                                }))}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Ship To
                                <span className="text-xs ml-1 border-blue-500 pb-1 cursor-pointer text-blue-500 border-b-dotted" onClick={handleShippingMode}>
                                    (Same as Billing?)
                                </span>
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                placeholder="Shipping Address"
                                value={formState.shipTo.address.address}
                                onChange={(e) => setFormState(prevState => ({
                                    ...prevState,
                                    shipTo: { ...prevState.shipTo, address: { address: e.target.value } }
                                }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add Products
                            </label>
                            <AutocompleteProductInput value={inputValue} onChange={handleProductChange} setInputValue={setInputValue} />
                        </div>

                        {formState.products.length > 0 && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formState.products.map((product, index) => (
                                        <tr key={index} className="text-sm">
                                            <td className="px-2 py-4 whitespace-nowrap">{product.parentName} - {product.childName}</td>
                                            <td className="px-2 py-4 whitespace-nowrap">{product.childSKU}</td>
                                            <td className="px-2 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={product.price}
                                                    onChange={(e) => setUnitPriceChange(index, Number(e.target.value))}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                                                    min={0}
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                                                    min={1}
                                                />
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap">${(product.price * product.quantity).toFixed(2)}</td>
                                            <td className="px-2 py-4 whitespace-nowrap">
                                                <button type="button" onClick={() => handleRemoveProduct(index)} className="text-red-600 hover:text-red-800">
                                                    <MdDelete className="ml-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Before Tax
                                </label>
                                <input
                                    type="number"
                                    value={formState.totalBeforeTax.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transportation Cost
                                </label>
                                <input
                                    type="number"
                                    name="transportation"
                                    value={formState.transportation}
                                    onChange={handleInputChange}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST ({selectedDealer?.province?.gst}%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.gst.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    HST ({selectedDealer?.province?.hst}%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.hst.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    QST ({selectedDealer?.province?.qst}%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.qst.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PST ({selectedDealer?.province?.pst}%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.pst.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grand Total
                                </label>
                                <input
                                    type="number"
                                    value={formState.grandTotal?.toFixed(2)}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Agent Commission ({formState.agent?.commission}%)
                                </label>
                                <input
                                    type="number"
                                    value={formState.agent ? ((formState.agent?.commission || 0) * formState.grandTotal / 100)?.toFixed(2) : ''}
                                    readOnly
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
                                    placeholder={formState.agent ? '' : 'No agent selected for this order.'}
                                />
                            </div> */}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-lg"
                        >
                            {id ? 'Update Order' : 'Create Order Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;