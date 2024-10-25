import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../config/models/product';
import _ from 'lodash';
import { FaSpinner } from 'react-icons/fa';
import { productApis } from '../config/apiRoutes/productRoutes';

const AutocompleteProductInput: React.FC<{ value: string, setInputValue: (any), onChange: (product: Product) => void, supplier?: string }> = ({ value, onChange, setInputValue, supplier }) => {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            debouncedFetchProducts(value);
        } else {
            setFilteredProducts([]);
        }
    }, [value]);

    const fetchProducts = async (search: string) => {
        try {
            if (search.length < 4)
                return
            setLoading(true);
            const response = await productApis.getAllProducts({ page: 1, limit: 25, filters: {  nameSearch:search, supplier } });
            const data: Product[] = response.data.products;
            setFilteredProducts(data);
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const debouncedFetchProducts = useCallback(
        _.debounce((query: string) => fetchProducts(query), 300),
        []
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setInputValue(query);
        setShowDropdown(true);
    };

    const handleProductSelect = (product: Product) => {
        onChange(product);
        setShowDropdown(false);
    };

    return (
        <div className="relative flex-grow" ref={wrapperRef}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type to search product"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
            />
            {showDropdown && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {loading && (
                        <li className="flex justify-center items-center py-2">
                            <FaSpinner className="animate-spin text-indigo-500" />
                        </li>
                    )}
                    {!loading && filteredProducts.length > 0 && filteredProducts.map(product => (
                        <li
                            key={product._id}
                            onClick={() => handleProductSelect(product)}
                            className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                        >
                            {product.name}
                        </li>
                    ))}
                    {!loading && filteredProducts.length < 1 && (
                        value.length < 4 ? <li className="px-4 py-2">Enter 4 characters to start searching</li> : <li className="px-4 py-2">No Products Found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteProductInput;
