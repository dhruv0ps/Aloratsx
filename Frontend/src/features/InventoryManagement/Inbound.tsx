import React, { useState, useEffect } from 'react';
import { Button, TextInput, Table } from 'flowbite-react';
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
        const data = {
          product: item.parent_id,
          child: item.SKU,
          location:item.parent_id,
          quantity: item.quantity,
        };
        const response = await inventoryApi.createInventory(data);
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inbound Management</h1>

      <div className="mb-4">
        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">Product:</label>
        <AutocompleteProductInput value={productInputValue} setInputValue={setProductInputValue} onChange={handleProductSelection} />
      </div>

      {currentDraft && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {currentDraft.parentName} - {currentDraft.name}</p>
            <p><strong>Color:</strong> {currentDraft.color.name}</p>
          </div>
          <div>
            <p><strong>Current Stock:</strong> {currentDraft.stock}</p>
            <TextInput
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <Button onClick={handleAddItem} disabled={!currentDraft || currentDraft.quantity <= 0}>Add to Inbound List</Button>
        <Button color="failure" onClick={handleDiscardDraft} disabled={!currentDraft}>Discard Draft</Button>
      </div>

      {inboundList.length > 0 && (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>SKU</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Color</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {inboundList.map((item, index) => (
                <Table.Row key={item.SKU}>
                  <Table.Cell>{item.SKU}</Table.Cell>
                  <Table.Cell>{item.parentName} - {item.name}</Table.Cell>
                  <Table.Cell>{item.color.name}</Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    <Button color="failure" onClick={() => handleRemoveItem(index)}>Remove</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button color="success" onClick={handleTransferToInventory} disabled={loading}>
              {loading ? 'Transferring...' : 'Transfer to Inventory'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default InboundPage;