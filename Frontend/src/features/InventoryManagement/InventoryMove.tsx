import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Checkbox, TextInput } from 'flowbite-react';
import AutocompleteLocation from '../../util/AutoCompleteInvLocation';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import Loading from '../../util/Loading';
import { Location as InvLocation } from '../../config/models/supplier';
import { Inventory } from '../../config/models/inventory';
import showConfirmationModal from '../../util/confirmationUtil';

interface InvMoveInterface extends Inventory {
    moveQuantity?: number;
}
const InventoryMove: React.FC = () => {
    const [sourceLocation, setSourceLocation] = useState<InvLocation>();
    const [destinationLocation, setDestinationLocation] = useState<InvLocation>();
    const [inventoryItems, setInventoryItems] = useState<InvMoveInterface[]>([]);
    const [selectedItems, setSelectedItems] = useState<{ id: string, quantity: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (sourceLocation) {
            fetchInventoryItems();
        }
    }, [sourceLocation]);

    const fetchInventoryItems = async () => {
        setLoading(true);
        try {
            const response = await inventoryApi.getInventoryByLocation(sourceLocation?._id ?? "");
            if (response.status) {
                setInventoryItems(response.data);
            } else {
                toast.error(response.err);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.err || 'Failed to fetch inventory items');
        } finally {
            setLoading(false);
        }
    };

    const handleSourceLocationSelection = (location: InvLocation) => {
        setSourceLocation(location);
        setSelectedItems([]);
    };

    const handleDestinationLocationSelection = (location: InvLocation) => {
        if (sourceLocation?._id === location._id) {
            setDestinationLocation(undefined)
            toast.warn("Cannot move products to same inventory location.")
        }
        else
            setDestinationLocation(location);
    };

    const handleItemSelection = (itemId: string, checked: boolean, quantity: number = 0) => {
        setSelectedItems(prev =>
            checked
                ? [...prev, { id: itemId, quantity }]
                : prev.filter(item => item.id !== itemId)
        );
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        setInventoryItems(prev =>
            prev.map(item =>
                item._id === itemId ? { ...item, moveQuantity: quantity } : item
            )
        );

        setSelectedItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const handleConfirmMove = async (e: React.FormEvent) => {
        e.stopPropagation()
        const confirmed = await showConfirmationModal("Are you sure you want to move the selected items?");
        if (confirmed) {
            await handleSubmit()
            console.log("Item moved");
        } else {
            console.log("Move cancelled");
        }
    };

    const handleSubmit = async () => {
        // e.preventDefault();
        if (!sourceLocation || !destinationLocation || selectedItems.length === 0) {
            toast.error('Please select source, destination, and at least one item');
            return;
        }
        if (sourceLocation?._id === destinationLocation?._id) {
            toast.warn("Cannot move products to same inventory location.")
            return;
        }
        setLoading(true);
        try {
            const data = {
                sourceLocation: sourceLocation,
                destinationLocation: destinationLocation,
                items: selectedItems
            };
            const response = await inventoryApi.moveInventory(data);
            if (response.status) {
                toast.success('Inventory moved successfully');
                navigate('/logs');
            } else {
                toast.error(response.err);
            }
        } catch (error: any) {
            console.error('Failed to move inventory');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <form className="max-w-4xl mx-auto bg-white p-8 rounded-lg">
            <div className="flex items-center mb-12 justify-between">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Move Inventory</h2>
                <p></p>
            </div>

            <div className="mb-4">
                <label htmlFor="sourceLocation" className="block text-sm font-medium text-gray-700 mb-2"> <span className="text-red-600">*</span> Source Location:</label>
                <AutocompleteLocation
                    onSelect={handleSourceLocationSelection}
                    value={sourceLocation}
                />
            </div>

            {sourceLocation && inventoryItems.length > 0 ? (
                <div className="mb-4 overflow-x-auto">
                    <h3 className="text-lg font-medium mb-2"><span className="text-red-600">*</span>Select Items to Move:</h3>
                    <Table>
                        <Table.Head>
                            <Table.HeadCell>Select</Table.HeadCell>
                            <Table.HeadCell>Product</Table.HeadCell>
                            <Table.HeadCell>Child SKU</Table.HeadCell>
                            <Table.HeadCell>Quantity</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {inventoryItems.map((item) => (
                                <Table.Row key={item._id}>
                                    <Table.Cell>
                                        <Checkbox
                                            checked={selectedItems.some(selected => selected.id === item._id)}
                                            onChange={(e) => handleItemSelection(item._id, e.target.checked, item.moveQuantity || 0)}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>{item.product.name}</Table.Cell>
                                    <Table.Cell>{item.child}</Table.Cell>
                                    <Table.Cell>{item.quantity}</Table.Cell>
                                    <Table.Cell>
                                        <TextInput
                                            type="number"
                                            min={0}
                                            max={item.quantity}
                                            value={item.moveQuantity || item.quantity}
                                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value, 10))}
                                            disabled={!selectedItems.some(selected => selected.id === item._id)}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            ) : <TextInput placeholder='No Products found at this inventory location.' disabled className='my-5' />}

            <div className="mb-4">
                <label htmlFor="destinationLocation" className="block text-sm font-medium text-gray-700 mb-2"> <span className="text-red-600">*</span> Destination Location:</label>
                <AutocompleteLocation
                    onSelect={handleDestinationLocationSelection}
                    value={destinationLocation}
                />
            </div>

            <Button color={'purple'} onClick={(e: any) => handleConfirmMove(e)} disabled={loading || !sourceLocation || !destinationLocation || selectedItems.length === 0} className="w-full bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                {loading ? 'Moving...' : 'Move Inventory'}
            </Button>

        </form>
    );
};

export default InventoryMove;