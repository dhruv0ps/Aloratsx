import React, { useState, useEffect } from 'react';
import { Button, TextInput, FileInput } from 'flowbite-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AutocompleteProductInput from '../../util/AutoCompleteProductInput';
import { Child } from '../../config/models/Child';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi'; // Ensure this import is correct

type ExtendedChild = Child & { parentName: string; parent_id: string };

interface InboundItem extends ExtendedChild {
  quantity: number;
}

const InboundPage: React.FC = () => {
  const [currentDraft, setCurrentDraft] = useState<InboundItem | null>(null);
  const [inboundList, setInboundList] = useState<InboundItem[]>([]);
  const [productInputValue, setProductInputValue] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>(''); // New state for Reference Number
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDraft = localStorage.getItem('currentInboundDraft');
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      setCurrentDraft(parsedDraft);
      setProductInputValue(`${parsedDraft.parentName} - ${parsedDraft.name}`);
      setQuantity(parsedDraft.quantity);
    }

    const savedList = localStorage.getItem('inboundList');
    if (savedList) {
      setInboundList(JSON.parse(savedList));
    }
  }, []);

  useEffect(() => {
    if (currentDraft) {
      localStorage.setItem('currentInboundDraft', JSON.stringify(currentDraft));
    }
  }, [currentDraft]);

  useEffect(() => {
    localStorage.setItem('inboundList', JSON.stringify(inboundList));
  }, [inboundList]);

  const handleProductSelection = (product: ExtendedChild) => {
    const newDraft: InboundItem = {
      ...product,
      quantity: 0
    };
    setCurrentDraft(newDraft);
    setProductInputValue(`${product.parentName} - ${product.name}`);
    setQuantity(0);
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    if (currentDraft && value >= 0) {
      setCurrentDraft({
        ...currentDraft,
        quantity: value
      });
    }
  };

  const handleAddItem = () => {
    if (!currentDraft || currentDraft.quantity <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    const existingItemIndex = inboundList.findIndex(item => item.SKU === currentDraft.SKU);
    if (existingItemIndex !== -1) {
      const updatedList = [...inboundList];
      updatedList[existingItemIndex].quantity += currentDraft.quantity;
      setInboundList(updatedList);
    } else {
      setInboundList([...inboundList, currentDraft]);
    }

    setCurrentDraft(null);
    setProductInputValue('');
    setQuantity(0);
    localStorage.removeItem('currentInboundDraft');
  };

  const handleRemoveItem = (index: number) => {
    const updatedList = inboundList.filter((_, i) => i !== index);
    setInboundList(updatedList);
  };

  const handleDiscardDraft = () => {
    setCurrentDraft(null);
    setProductInputValue('');
    setQuantity(0);
    localStorage.removeItem('currentInboundDraft');
  };

  const handleTransferToInventory = async () => {
    if (inboundList.length === 0) {
      toast.error('Please add items to the inbound list');
      return;
    }

    setLoading(true);
    try {
      for (const item of inboundList) {
        const formData = new FormData();
        formData.append('product', item.parent_id);
        formData.append('child', item.SKU);
        formData.append('parent_id', item.parent_id);
        formData.append('quantity', item.quantity.toString());
        formData.append('referenceNumber', referenceNumber);
        formData.append('parentName', item.parentName); // Include parent name
        if (receiptFile) {
          formData.append('receiptFile', receiptFile); // Add receipt file
        }

        const response = await inventoryApi.createInventory(formData);
        if (!response.status) {
          throw new Error(response.err || 'Failed to add item to inventory');
        }
      }
      
      toast.success('All items transferred to inventory successfully');
      setInboundList([]);
      localStorage.removeItem('inboundList');
      navigate('/inventory/view');
    } catch (error: any) {
      
      console.error(error.response?.data?.err || 'Something went wrong');
      toast.error('Failed to transfer some items to inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Inbound Management</h1>

      <div className="mb-4">
        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">Product:</label>
        <AutocompleteProductInput value={productInputValue} setInputValue={setProductInputValue} onChange={handleProductSelection} />
      </div>

      <div className="mb-4">
        <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Reference Number:
        </label>
        <TextInput
          id="referenceNumber"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Enter reference number"
        />
      </div>

      {/* Upload Receipt */}
      <div className="mb-4">
        <label htmlFor="receiptFile" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Receipt:
        </label>
        <FileInput
          id="receiptFile"
          onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      {currentDraft && (
        <div className="bg-gray-50 p-4 rounded-lg shadow mb-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">{currentDraft.parentName} | {currentDraft.name}</p>
            <p className="text-sm text-gray-500">SKU: {currentDraft.SKU}</p>
          </div>
          <div className="flex items-center space-x-4">
            <TextInput
              type="number"
              className="w-16"
              value={quantity}
              min={1}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
            />
            <Button color="failure" size="sm" onClick={handleDiscardDraft}>Remove</Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <Button onClick={handleAddItem} color="dark" disabled={!currentDraft || currentDraft.quantity <= 0}>Add to Inbound List</Button>
        <Button color="failure" onClick={handleDiscardDraft} disabled={!currentDraft}>Discard Draft</Button>
      </div>

      {inboundList.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Added Products</h2>
          {inboundList.map((item, index) => (
            <div key={item.SKU} className="flex justify-between items-center mb-2 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-semibold">{item.parentName} | {item.name}</p>
                <p className="text-sm text-gray-500">SKU: {item.SKU}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg">{item.quantity}</span>
                <Button color="failure" size="sm" onClick={() => handleRemoveItem(index)}>Remove</Button>
              </div>
            </div>
          ))}
          <div className="mt-4 flex justify-center">
            <Button color="dark" onClick={handleTransferToInventory} disabled={loading}>
              {loading ? 'Transferring...' : 'Create Draft'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundPage;
