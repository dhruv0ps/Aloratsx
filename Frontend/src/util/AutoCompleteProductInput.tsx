import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Child } from '../config/models/Child';
import { Product } from '../config/models/product';
import _ from 'lodash';
import { FaSpinner } from 'react-icons/fa6';
import { productApis } from '../config/apiRoutes/productRoutes';

const AutocompleteProductInput: React.FC<{ value: string, setInputValue: (any), onChange: (product: Child & { parentName: string, parent_id: string }) => void }> = ({ value, onChange, setInputValue }) => {
    const [filteredProducts, setFilteredProducts] = useState<(Child & { parentName: string, parent_id: string })[]>([]);
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
            if (search.length < 1) return;
            setLoading(true);
    
         
            const response = await productApis.getAllProducts({ page: 1, limit: 25, filters: { nameSearch: search } });
    
            
            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error("Invalid API response structure:", response);
                return; 
            }
    
            const data: Product[] = response.data; 
    
           
            const filteredProducts = data.flatMap(product =>
                product.children
                    .filter(child => 
                        child.name.toLowerCase().includes(search.toLowerCase()) || 
                        product.name.toLowerCase().includes(search.toLowerCase())
                        || child.SKU.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(child => ({
                        ...child,
                        parentName: product.name,
                        parent_id: product._id,
                    }))
            );
    
            setFilteredProducts(filteredProducts);
        } catch (error: any) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };
    
    
    const debouncedFetchProducts = useCallback(
        _.debounce((query: string) => fetchProducts(query), 1000), 
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
        setInputValue(query)
        setShowDropdown(true);
    };

    const handleProductSelect = (product: Child & { parentName: string, parent_id: string }) => {
        onChange(product);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
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
                    {
                        !loading && filteredProducts.length > 0 ? filteredProducts.map(product => (
                            <li
                                key={product.SKU}
                                onClick={() => handleProductSelect(product)}
                                className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                            >
                                {product.SKU} | {product.parentName} {product.name} | 
                            </li>
                        )) : !loading && value.length < 1 ? <li className="px-4 py-2">Start typing to see products available</li> : !loading && <li className="px-4 py-2">No Products Found</li>
                    }

                </ul>
            )}
        </div>
    );
};

export default AutocompleteProductInput;
