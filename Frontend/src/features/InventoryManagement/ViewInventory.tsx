import React, { useEffect, useState, useCallback } from 'react';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import { Button, Table, Select, Checkbox, Dropdown } from 'flowbite-react';
import Loading from '../../util/Loading';
import { useNavigate } from 'react-router-dom';
// import { Product } from '../../config/models/product';
import { Child } from '../../config/models/Child';
// import AutocompleteProductInput from '../../util/AutoCompleteInventory';
import { productApis } from '../../config/apiRoutes/productRoutes';
import debounce from 'lodash.debounce';

const InventoryTable: React.FC = () => {
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventories, setInventories] = useState<any[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<any[]>([]);
  const [productInputValue, setProductInputValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [childOptions, setChildOptions] = useState<Child[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
console.log(setProductInputValue);
console.log(setChildOptions);
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [currentPage, productInputValue, categoryFilter, selectedChildren]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, inventories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await productApis.GetCategories();
      setAllCategories(response.data.map((ctgry: { name: string }) => ctgry.name));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventories = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const filters = {
          page: currentPage,
          category: categoryFilter,
          product: productInputValue,
          selectedChildren: selectedChildren.join(','),
        };
        const response = await inventoryApi.getAllInventory(filters);
        setInventories(response.data.inventories);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching inventories:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [currentPage, productInputValue, categoryFilter, selectedChildren]
  );

//   const handleProductSelection = (product: Product) => {
//     if (Array.isArray(product.children)) {
//       setChildOptions(product.children);
//     } else {
//       setChildOptions([]);
//     }
//     setSelectedProduct(product);
//     setProductInputValue(product.name);
//   };

  const toggleChildSelection = (childSKU: string) => {
    setSelectedChildren((prevSelected) => {
      if (prevSelected.includes(childSKU)) {
        return prevSelected.filter((sku) => sku !== childSKU);
      } else {
        return [...prevSelected, childSKU];
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredInventories(inventories);
      return;
    }
    const filtered = inventories.filter(
      (inventory) =>
        inventory.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inventory.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inventory.child.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventories(filtered);
  };

  return (
    <div className="container mx-auto p-5">
      <div className="flex items-center justify-between mb-8">
        <Button color="gray" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h2 className="text-2xl font-semibold">Inventory</h2>
      </div>
      <div className="flex gap-4 mb-4">
        {/* <AutocompleteProductInput
          value={productInputValue}
          setInputValue={setProductInputValue}
          onChange={handleProductSelection}
        /> */}
        {Array.isArray(childOptions) && childOptions.length > 0 && (
          <Dropdown label="Children" dismissOnClick={false}>
            {childOptions.map((child) => (
              <Dropdown.Item key={child.SKU}>
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
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-grow"
        >
          <option value="">All Categories</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or SKU"
          className="p-2 border rounded w-full"
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="shadow-md rounded-lg p-5 bg-white">
          <Table striped>
            <Table.Head>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Parent Name</Table.HeadCell>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Child Name (SKU)</Table.HeadCell>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Quantity</Table.HeadCell>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Booked</Table.HeadCell>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Damaged</Table.HeadCell>
              <Table.HeadCell style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Last Updated</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {filteredInventories.map((inventory) => (
                <Table.Row key={inventory._id}>
                  <Table.Cell style={{ padding: '12px', color: '#4b5563' }} >{inventory.productName}</Table.Cell>
                  <Table.Cell  style={{ padding: '12px', color: '#4b5563' }}>
                    {inventory.childName} ({inventory.child})
                  </Table.Cell>
                  <Table.Cell style={{ padding: '12px', color: '#4b5563' }}>{inventory.quantity}</Table.Cell>
                  <Table.Cell style={{ padding: '12px', color: '#4b5563' }}>{inventory.booked}</Table.Cell>
                  <Table.Cell style={{ padding: '12px', color: '#4b5563' }}>{inventory.damaged}</Table.Cell>
                  <Table.Cell style={{ padding: '12px', color: '#4b5563' }}>
                    {new Date(inventory.updatedAt).toISOString().split('T')[0]}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div className="flex justify-center items-center mt-4">
            <Button
              color="gray"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              color="gray"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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
