import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import AutocompleteProductInput from '../../util/AutoCompleteInventory';
import AutocompleteChildInput from '../../util/AutoCompleteChild';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import Loading from '../../util/Loading';
import { Child } from '../../config/models/Child';
import { Product } from '../../config/models/product';
import AutocompleteLocation from '../../util/AutoCompleteInvLocation';
import { Location as InvLocation } from '../../config/models/supplier';

const AddStartingStock: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [child, setChild] = useState<Child | null>(null);
    const [location, setLocation] = useState<InvLocation>();
    const [startingQty, setStartingQty] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [childInputValue, setChildInputValue] = useState<string>('');
    const navigate = useNavigate();

    const handleProductSelection = (product: Product) => {
        setChild(null)
        setChildInputValue("")
        setSelectedProduct(product);
        setProductInputValue(`${product.name}`);
    };

    const handleChildChange = (child: Child) => {
        setChild(child);
        setChildInputValue(`${child.SKU} - ${selectedProduct?.name} ${child.name}`)
    };

    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartingQty(Number(e.target.value));
    };

    const handleLocationSelection = (location: InvLocation) => {
        setLocation(location);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !child || !location) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const data = {
                product: selectedProduct._id,
                child: child.SKU,
                location: location._id,
                quantity: startingQty,
            };
            const response = await inventoryApi.createInventory(data);
            if (response.status) {
                toast.success('Starting stock added successfully');
                navigate('/inventory/view');
            } else {
                console.error(response.err);
            }
        } catch (error: any) {
            console.error(error.response?.data?.err || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
            <div className="flex items-center mb-12 justify-between">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Add Starting Stock</h2>
                <p></p>
            </div>

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
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Inventory Location:</label>
                <AutocompleteLocation
                    onSelect={handleLocationSelection}
                    value={location}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="startingQty" className="block text-sm font-medium text-gray-700 mb-2">Starting Quantity:</label>
                <TextInput
                    id="startingQty"
                    type="number"
                    min={0}
                    value={startingQty}
                    onChange={handleQtyChange}
                    required
                />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {loading ? 'Saving...' : 'Add Starting Stock'}
            </button>
        </form>
    );
};

export default AddStartingStock;
