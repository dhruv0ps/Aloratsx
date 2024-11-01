import React, { useState, } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';
import AutocompleteProductInput from '../../util/AutoCompleteInventory';
import AutocompleteChildInput from '../../util/AutoCompleteChild';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import Loading from '../../util/Loading';
import { Child } from '../../config/models/Child';
import { Product } from '../../config/models/product';

const AddStartingStock: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<any| null>(null);
    const [child, setChild] = useState<Child | null>(null);
    const [startingQty, setStartingQty] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [childInputValue, setChildInputValue] = useState<string>('');
    const navigate = useNavigate();
console.log(child)
    const handleProductSelection = (product: Product) => {
        // Reset child state and child input value
        setChild(null);
        setChildInputValue("");

        // Set the selected product
        setSelectedProduct(product);
        setProductInputValue(`${product.name}`);

        // Optional: Auto-select the first child if the product has children
        if (product.children && product.children.length > 0) {
            const defaultChild = product.children[0];
            setChild(defaultChild);
            setChildInputValue(`${defaultChild.SKU} - ${product.name} ${defaultChild.name}`);
        }
    };
console.log(childInputValue)
const handleChildChange = (child: any) => {
    setChild(child);
    // Set the childInputValue to only the SKU
    setChildInputValue(child);
};

  
    const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartingQty(Number(e.target.value));
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
                product: selectedProduct._id,
                parentName : selectedProduct.parentName,
                parent_id : selectedProduct.parent_id,
                child: childInputValue,
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
