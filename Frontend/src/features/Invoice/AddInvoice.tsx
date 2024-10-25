import React, { useState, useEffect } from 'react';
import { Button, Table, Select } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { invoiceApis } from '../../config/apiRoutes/InvoiceRoutes';
// import { InvoiceItem } from '../../config/models/Invoice';
import Loading from '../../util/Loading';
import AutoCompleteDealerInput from '../../util/AutoCompleteDealer';
import { ApprovedDealer } from '../../config/models/dealer';
import { toast } from 'react-toastify';
import { taxSlab } from '../../config/models/taxslab';
import { commonApis } from '../../config/apiRoutes/commonRoutes';
import { OrderWithData } from '../../config/models/order';

const AddInvoice: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDealer, setSelectedDealer] = useState<ApprovedDealer | null>(null);
    const [orders, setOrders] = useState<OrderWithData[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<OrderWithData[]>([]);
    const [taxSlab, setTaxSlab] = useState<taxSlab | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [taxSlabs, setTaxSlabs] = useState<taxSlab[]>([]);
    const [checkboxState, setCheckBoxState] = useState<boolean>(false)

    useEffect(() => {
        const fetchTaxSlabs = async () => {
            setLoading(true);
            try {
                const taxSlabResponse = await commonApis.getAllTaxSlabs();
                setTaxSlabs(taxSlabResponse.data);
            } catch (error) {
                console.error('Error fetching tax slabs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxSlabs();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            if (selectedDealer) {
                try {
                    setOrders([]);
                    setSelectedOrders([]);
                    const response = await invoiceApis.getAllOrders({ id: selectedDealer._id });
                    if (response.status) {
                        setOrders(response.data);
                    }

                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [selectedDealer]);

    const handleDealerChange = (dealer: ApprovedDealer) => {
        setSelectedDealer(dealer);
        setTaxSlab(dealer.province);
    };

    const handleOrderSelection = (order: OrderWithData) => {
        const isSelected = selectedOrders.some(selectedOrder => selectedOrder._id === order._id);
        if (isSelected) {
            setSelectedOrders(prevOrders => prevOrders.filter(selectedOrder => selectedOrder._id !== order._id));
        } else {
            setSelectedOrders(prevOrders => [...prevOrders, order]);
        }
    };

    const checkBoxHandler = () => {
        setCheckBoxState(!checkboxState)
        // const newTaxSlab=taxSlabs.find(slab => slab.name === "EXPTAX")
        // setTaxSlab(newTaxSlab || null)
    }

    const handleTaxSlabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let newTaxSlab = null;
        const selectedTaxSlabId = e.target.value;
        if (checkboxState) {
            newTaxSlab = taxSlabs.find(slab => slab.name === "EXPTAX");
            setTaxSlab(newTaxSlab || null);
        }
        else {
            newTaxSlab = taxSlabs.find(slab => slab._id === selectedTaxSlabId);
            setTaxSlab(newTaxSlab || null);
        }

    };

    const calculateTotalBeforeTax = (order: OrderWithData) => {
        return order.products.reduce((total, product) => total + product.price * product.quantity, 0);
    };

    const calculateGrandTotal = () => {
        const totalBeforeTax = selectedOrders.reduce((total, order) => total + calculateTotalBeforeTax(order), 0);
        const taxRate = taxSlab && !checkboxState ? (taxSlab.gst + taxSlab.hst) / 100 : 0;
        const taxAmount = totalBeforeTax * taxRate;
        return totalBeforeTax + taxAmount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDealer || selectedOrders.length === 0 || !taxSlab) {
            toast.error("Please select a dealer, at least one order, and ensure a tax slab is selected.");
            return;
        }

        const invoiceData = {
            dealer: selectedDealer._id,
            orders: selectedOrders.map(order => order._id),
            taxSlab: taxSlab._id,
            totalBeforeTax: selectedOrders.reduce((total, order) => total + calculateTotalBeforeTax(order), 0),
            grandTotal: calculateGrandTotal(),
            type: checkboxState ? "estimate" : "invoice"
        };

        try {
            const response = await invoiceApis.addInvoice(invoiceData);
            if (response.status) {
                toast.success("Invoice successfully created.");
                navigate(`/yellowadmin/Invoice/InvoiceSummary/${response.invoice.invoiceNumber}`);
            }
        } catch (error) {
            console.error('Error submitting invoice:', error);
            toast.error("Failed to create invoice. Please try again.");
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-4 max-w-4xl mx-auto mt-6">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold flex-grow text-center">Create Invoice</h2>
            </div>
            <div className="mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        onChange={checkBoxHandler}
                        checked={checkboxState}
                    />
                    <span className="ml-2 text-gray-700">Estimate</span>
                </label>
            </div>
            <div className="mb-4 flex-grow">
                <label htmlFor="dealer" className="block text-sm font-medium text-gray-700 mb-1">Dealer</label>
                <AutoCompleteDealerInput value={selectedDealer?.contactPersonName ?? ""} onChange={handleDealerChange} />
            </div>

            {orders.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Available Orders</h2>
                    <div className="overflow-x-auto mt-4">
                        <Table striped>
                            <Table.Head>
                                <Table.HeadCell>Order Number</Table.HeadCell>
                                <Table.HeadCell>Products</Table.HeadCell>
                                <Table.HeadCell>Total Before Tax</Table.HeadCell>
                                <Table.HeadCell>Action</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {orders.map((order) => {
                                    const isOrderSelected = selectedOrders.some(selectedOrder => selectedOrder._id === order._id);
                                    return (
                                        <Table.Row key={order._id}>
                                            <Table.Cell>{order.purchaseOrderNumber}</Table.Cell>
                                            <Table.Cell>{order.products.map(p => p.childSKU).join(', ')}</Table.Cell>
                                            <Table.Cell>${calculateTotalBeforeTax(order).toFixed(2)}</Table.Cell>
                                            <Table.Cell>
                                                <Button
                                                    color={isOrderSelected ? 'failure' : 'success'}
                                                    onClick={() => handleOrderSelection(order)}
                                                >
                                                    {isOrderSelected ? 'Remove' : 'Add'}
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="tax-slab" className="block text-sm font-medium text-gray-700">Tax Slab</label>
                {<Select disabled={checkboxState} id="tax-slab" value={taxSlab?._id || ''} onChange={handleTaxSlabChange}>
                    <option value="">Select Tax Slab</option>
                    {taxSlabs.map(slab => (
                        <option key={slab._id} value={slab._id}>{slab.name} - (GST: {slab.gst}% | HST: {slab.hst}% | PST: {slab.pst}% | QST: {slab.qst}%)</option>
                    ))}
                </Select>}
            </div>

            <div className="mt-4 space-y-1 text-gray-500">
                <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
                <div className="flex justify-between mb-2">
                    <span>Total Before Tax:</span>
                    <span>${selectedOrders.reduce((total, order) => total + calculateTotalBeforeTax(order), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Tax Amount:</span>
                    <span>${(calculateGrandTotal() - selectedOrders.reduce((total, order) => total + calculateTotalBeforeTax(order), 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Grand Total:</span>
                    <span>${calculateGrandTotal().toFixed(2)}</span>
                </div>
            </div>

            <Button color={'purple'} onClick={handleSubmit} className="w-full mt-6">Create Invoice</Button>
        </div>
    );
};

export default AddInvoice;