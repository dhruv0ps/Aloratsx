import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MdEdit, MdImageNotSupported } from 'react-icons/md';
import { Button, Select, TextInput } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../util/Loading';
import { FaChevronLeft } from 'react-icons/fa6';
import { ProductWithData as Product } from '../../config/models/product';
import { productApis } from '../../config/apiRoutes/productRoutes';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import { ChildWithData } from '../../config/models/Child';

const STOCK_STATUSES = [
    'IN STOCK',
    'LOW STOCK',
    'VERY LOW IN STOCK',
    'OUT OF STOCK',
    'DISCONTINUED'
];

const ViewProducts: React.FC = () => {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [categories, setCategories] = useState<Set<string>>(new Set());
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedProduct, setSelectedProduct] = useState<ChildWithData | null>(null);
    const [nameSearch, setNameSearch] = useState<string>('');
    const [skuSearch, setSkuSearch] = useState<string>('');
    const [sortField, setSortField] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const navigate = useNavigate();
    const barcodeRef = useRef<HTMLDivElement>(null);

    // Fetch products based on filters
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productApis.getAllProducts(); // Add necessary filters here
            if (response.status) {
                setTotalPages(response.data.totalPages);
                setFilteredProducts(response.data.products);
                console.log(response.data)
            }
        } catch (err: any) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, nameSearch, skuSearch, selectedCategory, selectedStatus, sortField, sortOrder]);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const resCat = await productApis.GetCategories();
            if (resCat.status) {
                setCategories(new Set(resCat.data.map((category: { name: string }) => category.name)));
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, limit, sortField, sortOrder]);

    const handleApplySearch = () => {
        setPage(1); // Reset to first page when applying new filters
        fetchProducts();
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    const handleEdit = (productId: string) => {
        navigate(`/products/manage/${productId}`);
    };

    const handlePrintBarcode = useReactToPrint({
        content: () => barcodeRef.current,
    });

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            setSortField('');
            setSortOrder('asc');
        } else {
            const [field, order] = value.split('-');
            setSortField(field);
            setSortOrder(order as 'asc' | 'desc');
        }
    };

    const handleGenerateBarcode = useCallback((product: ChildWithData) => {
        setSelectedProduct(product);
        setTimeout(() => {
            handlePrintBarcode();
        }, 100);
    }, [handlePrintBarcode]);

    const BarcodeContent: React.FC<{ product: ChildWithData }> = React.memo(({ product }) => (
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

    if (loading) return <Loading />;

    return (
        <div className="mx-auto p-4 lg:px-8">
            <div className='mb-12 flex items-center justify-between'>
                <Button color='gray' onClick={() => navigate(-1)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h2 className="text-2xl font-semibold">Products Listing</h2>
                <Button color='green' className='ml-2' onClick={() => navigate("/yellowadmin/products/add")}>
                    <span className='flex gap-2 items-center'>Add Products</span>
                </Button>
            </div>

            <div className='flex flex-wrap gap-4 justify-between items-end mb-6'>
                <TextInput
                    className='flex-1 min-w-[200px]'
                    type="text"
                    placeholder="Search by name"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                />

                <TextInput
                    className='min-w-[200px]'
                    type="text"
                    placeholder="Search by SKU"
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                />

                <Select className='min-w-[200px]' value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">All Categories</option>
                    {[...categories].map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </Select>

                <Select className='min-w-[200px]' value={selectedStatus} onChange={handleStatusChange}>
                    <option value="">All Statuses</option>
                    {STOCK_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </Select>

                <Select className='min-w-[200px]' value={sortField ? `${sortField}-${sortOrder}` : ''} onChange={handleSortChange}>
                    <option value="">Default Sort</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="SKU-asc">SKU (A-Z)</option>
                    <option value="SKU-desc">SKU (Z-A)</option>
                </Select>

                <label className="flex flex-col text-gray-500">
                    <span className="text-sm">Items per page</span>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="rounded-md border-gray-300 py-2 px-4 focus:ring focus:ring-purple-200 transition"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </label>

                <Button color="purple" onClick={handleApplySearch}>
                    Apply Filters
                </Button>
            </div>

            <div className="overflow-x-auto">
                {filteredProducts.length > 0 ? (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Image</th>
                                <th className="py-3 px-6 text-left">Child Name</th>
                                <th className="py-3 px-6 text-left">Category</th>
                                <th className="py-3 px-6 text-left">SubCategory</th>
                                <th className="py-3 px-6 text-left">Child SKU</th>
                                <th className="py-3 px-6 text-left">Stock</th>
                                <th className="py-3 px-6 text-left">Color</th>
                                <th className="py-3 px-6 text-right">Price</th>
                                <th className="py-3 px-6 text-center">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {filteredProducts.flatMap(product =>
                                product.children.map(child => (
                                    <tr key={child.SKU} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                                {child.image
                                                    ? <img src={`${import.meta.env.VITE_BASE_IMAGE_URL}/${child.image.path}`} alt={child.name} className="object-contain w-full h-full" />
                                                    : <MdImageNotSupported className="text-gray-400 text-2xl" />}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-left">{product.name} - {child.name}</td>
                                        <td className="py-3 px-6 text-left">{product.category.name}</td>
                                        <td className="py-3 px-6 text-left">{product.subCategory?.name}</td>
                                        <td className="py-3 px-6 text-left">{child.SKU}</td>
                                        <td className="py-3 px-6 text-left">{child.stock}</td>
                                        <td className="py-3 px-6 text-left">
                                            <div className="flex items-center gap-x-5">
                                                {/* <div className="flex items-center space-x-4">
                                                    <input
                                                        type="color"
                                                        id="colorPicker"
                                                        value={child.color.hexCode}
                                                        className="w-8 h-8 p-0 border-0 rounded-lg cursor-pointer"
                                                        readOnly
                                                    />
                                                </div> */}
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-right">${child.selling_price}</td>
                                        <td className="py-3 px-6 text-center">
                                            <span className={`bg-${child.status === 'IN STOCK' ? 'green' : 'red'}-200 text-${child.status === 'IN STOCK' ? 'green' : 'red'}-600 py-1 text-nowrap px-3 rounded-full text-xs`}>
                                                {child.status}
                                            </span>
                                        </td>
                                        <td className="h-full gap-x-3 pt-4 flex justify-center items-center">
                                            <Button size="sm" color="warning" onClick={() => handleEdit(product._id)}>
                                                <MdEdit className="mr-1" /> Edit
                                            </Button>
                                            <Button size="sm" onClick={() => handleGenerateBarcode(child)}>
                                                Barcode
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p className='text-center text-gray-500 my-16'>No Products Found</p>
                )}
            </div>

            {/* Hidden div for barcode printing */}
            <div style={{ display: 'none' }}>
                <div ref={barcodeRef}>
                    {selectedProduct && <BarcodeContent product={selectedProduct} />}
                </div>
            </div>

            <div className='flex items-center justify-center mt-4'>
                <Button color="gray" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                    Previous
                </Button>
                <span className="mx-4">Page {page} of {totalPages}</span>
                <Button color="gray" disabled={page === totalPages || totalPages === 0} onClick={() => handlePageChange(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export default ViewProducts;
