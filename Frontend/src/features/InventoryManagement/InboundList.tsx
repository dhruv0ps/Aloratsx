import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import { Button, Table, Spinner, Dropdown } from 'flowbite-react';

import { useNavigate } from 'react-router-dom';
import { Product } from '../../config/models/product';
import { Child } from '../../config/models/Child';
import AutocompleteProductInput from '../../util/AutoCompleteParentProduct';

const InboundListPage: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [inboundList, setInboundList] = useState<any[]>([]);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [childOptions, setChildOptions] = useState<Child[]>([]);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
console.log(selectedProduct)
    useEffect(() => {
        fetchInboundList();
    }, []);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchInboundList(newPage);
    };

    const fetchInboundList = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await inventoryApi.getAllInventory({ page, limit: 20 });
            console.log(response)
            setTotalPages(response.data.totalPages);
            setInboundList(response.data.inventories);
        } catch (error: any) {
            console.error('Error fetching inbound list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelection = (product: Product) => {
        setChildOptions(product.children);
        setSelectedProduct(product);
        setProductInputValue(product.name);
    };

    const toggleChildSelection = (childSKU: string) => {
        setSelectedChildren((prevSelected) =>
            prevSelected.includes(childSKU)
                ? prevSelected.filter((sku) => sku !== childSKU)
                : [...prevSelected, childSKU]
        );
    };

    return (
        <div className="container mx-auto p-5">
            <div className="flex items-center justify-between mb-8">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Inbound List</h2>
            </div>
            <div className="flex gap-4">
                <AutocompleteProductInput
                    value={productInputValue}
                    setInputValue={setProductInputValue}
                    onChange={handleProductSelection}
                />
                {childOptions.length > 0 && (
                    <Dropdown label="Children" dismissOnClick={false}>
                        {childOptions.map((child) => (
                            <Dropdown.Item key={child.SKU}>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedChildren.includes(child.SKU)}
                                        onChange={() => toggleChildSelection(child.SKU)}
                                    />
                                    <span className="ml-2">{`${child.name} (${child.SKU})`}</span>
                                </label>
                            </Dropdown.Item>
                        ))}
                    </Dropdown>
                )}
            </div>
            {loading ? (
                <Spinner />
            ) : (
                <div className="overflow-x-auto mt-5">
                    <Table striped>
                        <Table.Head>
                            <Table.HeadCell>Inbound Number</Table.HeadCell>
                            <Table.HeadCell>Status</Table.HeadCell>
                            <Table.HeadCell>ReferenceNumber</Table.HeadCell>
                            <Table.HeadCell>Date</Table.HeadCell>
                            <Table.HeadCell>Items Count</Table.HeadCell>
                            <Table.HeadCell>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {inboundList.map((record) => (
                                <Table.Row key={record._id}>
                                    <Table.Cell className='text font-bold'>{record.inboundNumber}</Table.Cell>
                                    <Table.Cell>
    {record.enteryStatus === 'DRAFTED' ? (
        <span className="bg-red-400 text-white px-2 py-1 rounded-full text-sm font-semibold">
            DRAFT
        </span>
    ) : (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
            COMPLETED
        </span>
    )}
</Table.Cell>   
                                    <Table.Cell>{record.referenceNumber}</Table.Cell>
                                    <Table.Cell>
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </Table.Cell>
                                   

                                    <Table.Cell>{record.quantity}</Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            color="dark"
                                            size="sm"
                                            onClick={() => navigate(`/inventory/inbound/edit/${record._id}`)}
                                        >
                                            View
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    <div className="flex justify-center items-center mt-4">
                        <Button
                            color="gray"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="mx-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            color="gray"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InboundListPage;
