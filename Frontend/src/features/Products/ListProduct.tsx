import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Spinner } from 'flowbite-react';
import { productApis } from "../../config/apiRoutes/productRoutes";
import Barcode from "react-barcode";
import { Button, Select, TextInput,Modal } from 'flowbite-react'; 
import { MdEdit } from 'react-icons/md';
// import {FaTimes , FaCheck} from 'react-icons/fa';
import { FaInfoCircle, FaBarcode,  FaTrash,FaEdit } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import debounce from 'lodash/debounce';
import showConfirmationModal from '../../util/confirmationUtil';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import "../../Listproduct.css";
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
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);  // Current page
  const [barcodeReady, setBarcodeReady] = useState<boolean>(false);
  const [productsPerPage] = useState<number>(20); 
  const barcodeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);
console.log(error);
console.log(loading)

  useEffect(() => {
  
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
        .flatMap((product: any) => 
          product.children.map((child: any) => ({
            ...child, 
            parentProductId: product._id, 
            parentProductName: product.name,
          }))
        );
      setChildrenProducts(allChildren);
      setFilteredProducts(allChildren); 
    } catch (error) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  
  const handleFilter = useCallback(() => {
    const filtered = childrenProducts.filter((child: any) => {
      const matchesSearch =
        child.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.parentProductName.toLowerCase().includes(searchQuery.toLowerCase());

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
    setCurrentPage(0);
  }, [searchQuery, minPrice, maxPrice, sortField, sortOrder, childrenProducts]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current,
    onAfterPrint: () => setBarcodeReady(false),
  });

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product); // Set the selected product for the modal
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide the modal
  };
  const handleGenerateBarcode = (child: any) => {
    setSelectedProduct(child);
    setBarcodeReady(true);

    // Trigger print after a delay to ensure the barcode is fully rendered
    setTimeout(() => {
      handlePrint();
    }, 500);
  };

 
  const handleEditProduct = (productId: string) => {
   
    navigate(`/products/manage/${productId}`,{ state: { fromNavigation: true } });
  };
  const handleDeleteChild = async (productId: string, childSKU: string) => {
    
    const confirm = await showConfirmationModal("Are you sure you would like to delete this child product? This action cannot be undone.");

  
    if (!confirm) return;

    try {
        
        const response = await productApis.deleteChildProduct(productId, childSKU);
        console.log(response)

        if (response.status) {
          toast.success(response.message);
      
        }else {
          toast.error(response.message);
      }
        
        
        fetchProducts();
    } catch (error) {
       
        console.error('Failed to delete child product:', error);
       
    }
};
// const handleActivateDeactivateChild = async (parentProductId: string, childSKU: string, currentStatus: boolean) => {
//   const newStatus = !currentStatus;  // Flip the status

//   try {
//     // Call the API to update the status of the child product
//     const response = await productApis.updateChildProductStatus(parentProductId, childSKU, { isActive: newStatus });

//     // Log the response for debugging
  
//     console.log(response)
    
//     if (response && response.message) {
//       toast.success(response.message); 
//       fetchProducts(); 
//     } else {
//       toast.error('Failed to update child product status');
//     }
//   } catch (error) {
    
//     console.error('Error:', error);
//     toast.error('Error updating child product status');
//   }
// };



const pageCount = Math.ceil(filteredProducts.length/productsPerPage);
const currentProducts = filteredProducts.slice(currentPage * productsPerPage ,(currentPage + 1) * productsPerPage)

const handlePageClick = (selectedItem: { selected: number }) => {
  setCurrentPage(selectedItem.selected);
};

  const BarcodeContent: React.FC<{ product: any }> = React.memo(({ product }) => (
    <div key={product.SKU} style={{
      pageBreakInside: 'avoid',
     margin: '0 auto',
     marginTop:"300px",
      width: '340px',
      height: '288px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
       <Barcode value={product.SKU} width={2} height={144} fontSize={16} />
      <div style={{ fontSize: '12px', marginTop: '5x`px' }}>
        <div>{product.name}</div>
      </div>
    </div>
  ));

  return (
    <div >   
     <div className="mx-auto p-4 lg:px-8 ">
      <div className='mb-12 flex items-center justify-between  '>
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
      <div  className="overflow-x-auto">
        {currentProducts.length > 0 ? (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-center">Actions</th>
                <th className="py-3 px-6 text-left whitespace-nowrap">SKU</th>
                <th className="py-3 px-6 text-left whitespace-nowrap" >Parent Name</th>
                <th className="py-3 px-6 text-left whitespace-nowrap">Name</th>
                <th className="py-3 px-6 text-left whitespace-nowrap">Selling Price</th>
                <th className="py-3 px-6 text-left whitespace-nowrap">Stock</th>
                <th className="py-3 px-6 text-left whitespace-nowrap">Status</th>
                {/* <th className="py-3 px-6 text-left">Barcode</th> */}
                {/* <th className="py-3 px-6 text-left">Stock</th>
               */}
              </tr>
            </thead>
            <tbody className="text-gray-900 text-sm font-light">
            {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" color="purple" /> {/* Loader while loading */}
          </div>
        ) : currentProducts.map((child: any) => (
                <tr key={child.SKU} className="border-b border-gray-200 hover:bg-gray-100">
                 <td className="py-3 px-6 text-center">
  <div className="flex justify-center space-x-2">
   
    <Button size="sm" color="info" onClick={() => handleViewProduct(child)}>
      <FaInfoCircle className="mr-1 mt-1 " />
    </Button>
    <Button size="sm" color="warning" onClick={() => handleEditProduct(child.parentProductId)}>
    <FaEdit />
    </Button>
    <Button size="sm" color="failure" onClick={() => handleDeleteChild(child.parentProductId, child.SKU)}>
      <FaTrash className="h-5 w-5" />
    </Button> <Button size="sm" color="red" onClick={() => handleGenerateBarcode(child)}>
      <FaBarcode className="mr-2 mt-1" /> Barcode
    </Button>
  </div>
</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{child.SKU}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{child.parentProductName}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">{child.name}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">${child.selling_price.toFixed(2)}</td>
                  {/* <td className="py-3 px-6 text-left">${child.cost_price.toFixed(2)}</td> */}
                  <td className="py-3 px-6 text-left whitespace-nowrap"><span className={`${child.status === "IN STOCK"  ? "text-green-800" :"text-red-800"}`}>{child.status}</span></td>
                  <td className="py-3 px-6 text-left whitespace-nowrap ">{child.stock}</td>
                
                  


                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center my-20">
  <Spinner size="lg" color="purple" />
</div>
        )}
      </div>
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        containerClassName="pagination"
        previousLinkClassName="pagination__link pagination__link--previous"
        nextLinkClassName="pagination__link pagination__link--next"
        disabledClassName="pagination__link--disabled"
        activeClassName="pagination__link--active"
      />
      <ToastContainer />
     
      <div style={{ display: "none" }}>
        <div ref={barcodeRef}>
        {barcodeReady && selectedProduct && <BarcodeContent product={selectedProduct} />}
        </div>
      </div>
      <Modal show={showModal} onClose={handleCloseModal}>
        <Modal.Header>Product Details</Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Parent Product Name:</p>
                <p>{selectedProduct.parentProductName}</p>
              </div>
              <div>
                <p className="font-semibold">SKU:</p>
                <p>{selectedProduct.SKU}</p>
              </div>
              <div>
                <p className="font-semibold">Name:</p>
                <p>{selectedProduct.name}</p>
              </div>
              <div>
                <p className="font-semibold">Selling Price:</p>
                <p>${selectedProduct.selling_price.toFixed(2)}</p>
              </div>
              {/* <div>
                <p className="font-semibold">Cost Price:</p>
                <p>${selectedProduct.cost_price?.toFixed(2)}</p>
              </div> */}
              <div>
                <p className="font-semibold">Status:</p>
                <p>{selectedProduct.status}</p>
              </div>
              <div>
                <p className="font-semibold">Stock:</p>
                <p>{selectedProduct.stock}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>

  );
};

export default ListProduct;


