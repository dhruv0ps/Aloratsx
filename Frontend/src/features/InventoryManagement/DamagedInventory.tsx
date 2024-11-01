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

const DamagedProducts: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [child, setChild] = useState<Child | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [comments, setComments] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [childInputValue, setChildInputValue] = useState<string>('');
    const [damagedProducts, setDamagedProducts] = useState<any[]>([]);
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

    const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComments(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }
        if (!childInputValue) {
            toast.error('Please select a child SKU');
            return;
        }
        setLoading(true);
        try {
            const data = {
                product: selectedProduct._id, // Using _id of the selected product
                child: child?.SKU,
                quantity,
                comments,
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
            toast.error('An error occurred');
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
                                <Table.Cell>{product.product?.name || 'N/A'}</Table.Cell>
                                <Table.Cell>{product.child?.SKU || 'N/A'}</Table.Cell>
                                <Table.Cell>{product.quantity}</Table.Cell>
                                <Table.Cell>{product.comments}</Table.Cell>
                                <Table.Cell>{new Date(product.createdAt).toLocaleDateString()}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
};

export default DamagedProducts;
