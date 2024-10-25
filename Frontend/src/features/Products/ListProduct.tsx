import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { productApis } from "../../config/apiRoutes/productRoutes";
import Barcode from "react-barcode";
import { Button, Select, TextInput } from 'flowbite-react'; 
import { MdEdit } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import debounce from 'lodash/debounce';


const ListProduct: React.FC = () => {
  const [childrenProducts, setChildrenProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [minPrice, setMinPrice] = useState<number | "">(""); 
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortField, setSortField] = useState<string>(""); 
  const [sortOrder, setSortOrder] = useState<string>("asc"); 
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]); // Filtered products
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null); 
  const barcodeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);
console.log(error);
console.log(loading)

  useEffect(() => {
    // Debounced function for filtering products
    const debouncedSearch = debounce(handleFilter, 300);
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, minPrice, maxPrice, sortField, sortOrder, childrenProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApis.getAllProducts(); 
      const allChildren = response.data
        .filter((product: any) => product.children && product.children.length > 0)
        .flatMap((product: any) => product.children);
      setChildrenProducts(allChildren);
      setFilteredProducts(allChildren); // Initially set all products to filtered list
    } catch (error) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Debounced handler for filtering products
  const handleFilter = useCallback(() => {
    const filtered = childrenProducts.filter((child: any) => {
      const matchesSearch =
        child.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice =
        (minPrice === "" || child.selling_price >= minPrice) &&
        (maxPrice === "" || child.selling_price <= maxPrice);

      return matchesSearch && matchesPrice;
    });

    // Sorting logic based on selected field
    const sorted = filtered.sort((a: any, b: any) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortField === "price") {
        return sortOrder === "asc" ? a.selling_price - b.selling_price : b.selling_price - a.selling_price;
      }
      return 0; // Default: no sorting
    });

    setFilteredProducts(sorted);
  }, [searchQuery, minPrice, maxPrice, sortField, sortOrder, childrenProducts]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGenerateBarcode = (child: any) => {
    setSelectedProduct(child);
    handlePrint();
  };

  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current,
  });

  const BarcodeContent: React.FC<{ product: any }> = React.memo(({ product }) => (
    <div key={product.SKU} style={{
      pageBreakInside: 'avoid',
      marginBottom: '20px',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <Barcode value={product.SKU} width={2.5} height={60} fontSize={12} />
      <div style={{ fontSize: '12px', marginTop: '5px' }}>
        <div>{product.name}</div>
      </div>
    </div>
  ));

  return (
    <div className="mx-auto p-4 lg:px-8">
      <div className='mb-12 flex items-center justify-between'>
        <Button color='gray' onClick={() => window.history.back()}>
          <span className='flex gap-2 items-center'><MdEdit />Back</span>
        </Button>
        <h2 className="text-2xl font-semibold">Products Listing</h2>
        <Button color='green' className='ml-2' onClick={() => navigate("/yellowadmin/products/add")}>
          <span className='flex gap-2 items-center'>Add Products</span>
        </Button>
      </div>

      {/* Filters Section */}
      <div className='flex flex-wrap gap-4 justify-between items-end mb-6'>
        <TextInput
          className='flex-1 min-w-[200px]'
          type="text"
          placeholder="Search by SKU or Name"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />

        <TextInput
          className='min-w-[200px]'
          type="number"
          placeholder="Min Price"
          value={minPrice === "" ? "" : minPrice}
          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
        />

        <TextInput
          className='min-w-[200px]'
          type="number"
          placeholder="Max Price"
          value={maxPrice === "" ? "" : maxPrice}
          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
        />

        <Select className='min-w-[200px]' value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </Select>

        <Select className='min-w-[200px]' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>

        <Button color="purple" onClick={handleFilter}>
          Apply Filters
        </Button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {filteredProducts.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">SKU</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Selling Price</th>
                <th className="py-3 px-6 text-left">Cost Price</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Stock</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 text-sm font-light">
              {filteredProducts.map((child: any) => (
                <tr key={child.SKU} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left">{child.SKU}</td>
                  <td className="py-3 px-6 text-left">{child.name}</td>
                  <td className="py-3 px-6 text-left">${child.selling_price.toFixed(2)}</td>
                  <td className="py-3 px-6 text-left">${child.cost_price.toFixed(2)}</td>
                  <td className="py-3 px-6 text-left">{child.status}</td>
                  <td className="py-3 px-6 text-left">{child.stock}</td>
                  <td className="py-3 px-6 text-center">
                    <Button size="sm" color="blue" onClick={() => handleGenerateBarcode(child)}>
                      Barcode
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='text-center text-gray-500 my-16'>No Products Found</p>
        )}
      </div>

      {/* Hidden div for barcode printing */}
      <div style={{ display: "none" }}>
        <div ref={barcodeRef}>
          {selectedProduct && <BarcodeContent product={selectedProduct} />}
        </div>
      </div>
    </div>
  );
};

export default ListProduct;


