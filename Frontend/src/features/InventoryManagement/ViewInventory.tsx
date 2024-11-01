import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import { Button, Table, TextInput, Select, Checkbox, Dropdown } from 'flowbite-react';
import Loading from '../../util/Loading';
import { useNavigate } from 'react-router-dom';
// import { Inventory } from '../../config/models/inventory';
import { Product } from '../../config/models/product';
import { Child } from '../../config/models/Child';
import AutocompleteProductInput from '../../util/AutoCompleteParentProduct';
import { productApis } from '../../config/apiRoutes/productRoutes';

const InventoryTable: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filteredInventories, setFilteredInventories] = useState<any[]>([]);
    const [productInputValue, setProductInputValue] = useState<string>('');
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');
    const [childOptions, setChildOptions] = useState<Child[]>([]);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        fetchInventories();
    }, []);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const prods = await productApis.GetCategories();
            setAllCategories(prods.data.map((ctgry: { name: string }) => ctgry.name));
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInventories = async (filters = {}) => {
        try {
            setLoading(true);
            const response = await inventoryApi.getAllInventory({ ...filters, page: 1, limit: 20 });
            setTotalPages(response.data.totalPages);
            setFilteredInventories(response.data.inventories);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelection = (product: Product) => {
        setChildOptions(product.children);
        setSelectedProduct(product);
        setProductInputValue(`${product.name}`);
    };

    const handleApplyFilters = () => {
        const filters = {
            product: selectedProduct?.name || '',
            selectedChildren,
            category: categoryFilter,
            location: locationFilter,
        };
        fetchInventories(filters);
    };

    const toggleChildSelection = (childSKU: string) => {
        setSelectedChildren(prevSelected => {
            if (prevSelected.includes(childSKU)) {
                return prevSelected.filter(sku => sku !== childSKU);
            } else {
                return [...prevSelected, childSKU];
            }
        });
    };

    return (
        <div className="container mx-auto p-5">
            <div className="flex items-center justify-between mb-8">
                <Button color="gray" onClick={() => navigate(-1)}>
                    Back
                </Button>
                <h2 className="text-2xl font-semibold">Inventory</h2>
            </div>
            <div className="flex gap-4">
                <AutocompleteProductInput value={productInputValue} setInputValue={setProductInputValue} onChange={handleProductSelection} />
                {childOptions?.length > 0 && (
                    <Dropdown label="Children" dismissOnClick={false}>
                        {childOptions.map(child => (
                            <Dropdown.Item key={child.SKU} className="dropdown-item">
                                <Checkbox
                                    id={child.SKU}
                                    checked={selectedChildren.includes(child.SKU)}
                                    onChange={() => toggleChildSelection(child.SKU)}
                                />
                                <label className="ml-2">{`${child.name} (${child.SKU})`}</label>
                            </Dropdown.Item>
                        ))}
                    </Dropdown>
                )}
                <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="flex-grow">
                    <option value="">All Categories</option>
                    {allCategories.map((category: string) => (
                        <option key={`KEY__${category}`} value={category}>
                            {category}
                        </option>
                    ))}
                </Select>
                <TextInput
                    placeholder="Search location name"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="flex-grow"
                />
                <Button color="purple" onClick={handleApplyFilters}>
                    Apply
                </Button>
            </div>
            {loading ? (
                <Loading />
            ) : (
                <div className="overflow-x-auto mt-5">
                    <Table striped>
                        <Table.Head>
                            <Table.HeadCell>Parent Name</Table.HeadCell>
                            <Table.HeadCell>Child Name (SKU)</Table.HeadCell>
                            <Table.HeadCell>Quantity</Table.HeadCell>
                            <Table.HeadCell>Booked</Table.HeadCell>
                            <Table.HeadCell>Damaged</Table.HeadCell>
                            <Table.HeadCell>Last Updated</Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {filteredInventories.map(inventory => (
                                <Table.Row key={inventory._id}>
                                    <Table.Cell>{inventory.parentName}</Table.Cell>
                                    <Table.Cell>
                                        {inventory.childName} ({inventory.child})
                                    </Table.Cell>
                                    <Table.Cell>{inventory.quantity}</Table.Cell>
                                    <Table.Cell>{inventory.booked}</Table.Cell>
                                    <Table.Cell>{inventory.damaged}</Table.Cell>
                                    <Table.Cell>
                                        {new Date(inventory.updatedAt).toISOString().split('T')[0]}
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

export default InventoryTable;
