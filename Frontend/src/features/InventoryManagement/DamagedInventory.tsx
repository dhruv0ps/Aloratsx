import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Table, TextInput } from 'flowbite-react';
import AutocompleteProductInput from '../../util/AutoCompleteInventory';
import AutocompleteChildInput from '../../util/AutoCompleteChild';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import Loading from '../../util/Loading';
import { Child } from '../../config/models/Child';
import { Product } from '../../config/models/product';
import { DamagedProduct, DamagedProductFormData } from '../../config/models/damagedProduct';
import { Location as InvLocation } from '../../config/models/supplier';
import AutocompleteLocation from '../../util/AutoCompleteInvLocation';

const DamagedProducts: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [child, setChild] = useState<Child | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [comments, setComments] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [childInputValue, setChildInputValue] = useState<string>('');
    const [damagedProducts, setDamagedProducts] = useState<DamagedProduct[]>([]);
    const [location, setLocation] = useState<InvLocation>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDamagedProducts();
    }, []);

    const fetchDamagedProducts = async () => {
        try {
            const response = await inventoryApi.getDamagedProducts();
            setDamagedProducts(response.data);
        } catch (error: any) {
            toast.error('Failed to fetch damaged products');
        }
    };

    const handleProductSelection = (product: Product) => {
        setSelectedProduct(product);
        setProductInputValue(product.name);
    };

    const handleChildChange = (child: Child) => {
        setChild(child);
        setChildInputValue(`${child.SKU} - ${selectedProduct?.name} ${child.name}`);
    };

    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(Number(e.target.value));
    };
    const handleLocationSelection = (location: InvLocation) => {
        setLocation(location);
    };
    const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComments(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !child) {
            toast.error('Please fill in all fields');
            return;
        }
        if (!location) {
            toast.warn("Please select a location to proceed.")
            return
        }
        setLoading(true);
        try {
            const data: DamagedProductFormData = {
                product: selectedProduct._id,
                child: child.SKU,
                quantity,
                comments,
                location: location?._id ?? ""
            };
            await inventoryApi.addDamagedProduct(data);
            toast.success('Damaged product added successfully');
            setSelectedProduct(null);
            setChild(null);
            setQuantity(1);
            setComments('');
            setProductInputValue('');
            setChildInputValue('');
            fetchDamagedProducts();
        } catch (error: any) {
            console.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-lg">
            <div className="flex items-center mb-12 justify-between">
                <Button color="gray" onClick={() => navigate(-1)}>Back</Button>
                <h2 className="text-2xl font-semibold">Damaged Products</h2>
                <p></p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 mb-10">
                <div className="mb-4">
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">Product:</label>
                    <AutocompleteProductInput value={productInputValue} setInputValue={setProductInputValue} onChange={handleProductSelection} />
                </div>
                {selectedProduct && (
                    <div className="mb-4">
                        <label htmlFor="child" className="block text-sm font-medium text-gray-700 mb-2">Child SKU:</label>
                        <AutocompleteChildInput productId={selectedProduct._id} value={childInputValue} setInputValue={setChildInputValue} onChange={handleChildChange} />
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantity:</label>
                    <TextInput
                        id="quantity"
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={handleQtyChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">*Inventory Location:</label>
                    <AutocompleteLocation
                        onSelect={handleLocationSelection}
                        value={location}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">Comments:</label>
                    <textarea
                        id="comments"
                        value={comments}
                        onChange={handleCommentsChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {loading ? 'Adding...' : 'Add Damaged Product'}
                </button>
            </form>

            <h3 className="text-xl font-bold mb-3">Damaged Products List</h3>
            <div className="overflow-x-auto">
                <Table className="w-full border-collapse border">
                    <Table.Head>
                        <Table.HeadCell>Product</Table.HeadCell>
                        <Table.HeadCell>Child SKU</Table.HeadCell>
                        <Table.HeadCell>Quantity</Table.HeadCell>
                        <Table.HeadCell>Comments</Table.HeadCell>
                        <Table.HeadCell>Date</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {damagedProducts.map((product) => (
                            <Table.Row key={product._id}>
                                <Table.Cell>{product.product.name}</Table.Cell>
                                <Table.Cell>{product.child.SKU}</Table.Cell>
                                <Table.Cell>{product.quantity}</Table.Cell>
                                <Table.Cell>{product.comments}</Table.Cell>
                                <Table.Cell>{new Date(product.createdAt).toISOString().split("T")[0]}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
};

export default DamagedProducts;
