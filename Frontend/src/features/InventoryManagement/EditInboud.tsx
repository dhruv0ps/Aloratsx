import React, { useState, useEffect } from 'react';
import { Button, TextInput, FileInput } from 'flowbite-react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import AutocompleteProductInput from '../../util/AutoCompleteProductInput';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';

// type ExtendedChild = {
//   parentName: string;
//   parent_id: string;
//   name: string;
//   SKU: string;
//   quantity: number;
// };

const EditInboundPage: React.FC = () => {
  const { id } = useParams<{ id: any }>(); // Retrieve the inbound ID from the URL
  const [currentDraft, setCurrentDraft] = useState<any| null>(null);
  const [inboundList, setInboundList] = useState<any[]>([]);
  const [productInputValue, setProductInputValue] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  console.log(receiptFile)
  const navigate = useNavigate();
console.log(quantity);
  useEffect(() => {
    // Fetch the existing inbound data by ID
    const fetchInboundData = async () => {
      try {
        const response = await inventoryApi.getInventoryById(id);
        if (response.status) {
          const data = response.data;
          console.log(data)
          setCurrentDraft(data);
          setInboundList(data);
        //   setReferenceNumber(data.referenceNumber);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load inbound data');
      }
    };
    fetchInboundData();
  }, [id]);

  const handleMarkAsComplete = async () => {
    setLoading(true);
    try {
      // Construct an object with only the ID
      const requestBody = id
      // Send the data using the `inventoryApi.markAsComplete` method
      const response = await inventoryApi.markAsComplete(requestBody,id);
      if (response.status) {
        toast.success('Inbound marked as complete');
        navigate('inventory/inbound/view');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleProductSelection = (product: any) => {
    const newDraft: any = { ...product, quantity: 0 };
    setCurrentDraft(newDraft);
    setProductInputValue(`${product.parentName} - ${product.name}`);
    setQuantity(0);
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
  };

  const handleRemoveItem = (index: any) => {
    const updatedList = inboundList.filter((_, i) => i !== index);
    setInboundList(updatedList);
  };
  const getChildName = (product: any, childSKU: string) => {
    if (!product || !product.children) return 'Unknown';

    const matchingChild = product.children.find((child: any) => child.SKU === childSKU);
    return matchingChild ? matchingChild.name : 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Inbound</h1>
        <Button color="success" onClick={handleMarkAsComplete} disabled={loading}>
          {loading ? 'Processing...' : 'Mark as Complete'}
        </Button>
      </div>

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

      <div className="mb-4">
        <label htmlFor="receiptFile" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Receipt:
        </label>
        <FileInput id="receiptFile" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} />
      </div>

      {currentDraft && (
        <div className="bg-gray-50 p-4 rounded-lg shadow mb-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">{currentDraft.parentName} | {currentDraft.name}</p>
            <p>
              Child Name: {getChildName(currentDraft.product, currentDraft.child)} (SKU: {currentDraft.child})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <TextInput
              type="number"
              className="w-16"
              value={currentDraft.quantity}
              min={1}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            />
            <Button color="failure" size="sm" onClick={() => handleRemoveItem(null)}>Remove</Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <Button onClick={handleAddItem} color="dark" disabled={!currentDraft || currentDraft.quantity <= 0}>Add to Inbound List</Button>
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
                <span className="text-lg">{item.
quantity}</span>
                <Button color="failure" size="sm" onClick={() => handleRemoveItem(index)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditInboundPage;
