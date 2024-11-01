import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../config/models/product';
import _ from 'lodash';
import { FaSpinner } from 'react-icons/fa6';
import { productApis } from '../config/apiRoutes/productRoutes';

interface AutocompleteProductInputProps {
    value: string;
    setInputValue: (value: string) => void;
    onChange: (product: Product) => void;
}

const AutocompleteProductInput: React.FC<AutocompleteProductInputProps> = ({ value, onChange, setInputValue }) => {
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (value) {
            debouncedFetchProducts(value);  // Debounced fetching
        } else {
            setFilteredProducts([]);  // Clear results if no input
        }
    }, [value]);


    const fetchFilteredProducts = async (search: string) => {
        try {
            if (search.length < 4)
                return
            setLoading(true);
            const response = await productApis.getAllProducts({ page: 1, limit: 25, filters: { nameSearch: search } });
    
             
            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error("Invalid API response structure:", response);
                return; 
            }
    
            const data: Product[] = response.data; 
            console.log(response.data)
            const mappedProducts =data.flatMap(product =>
                product.children
                    .filter(child => 
                        child.name.toLowerCase().includes(search.toLowerCase()) || 
                        product.name.toLowerCase().includes(search.toLowerCase())
                        || child.SKU.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(child => ({
                        ...child,
                        parentName: product.name,
                        product_id: product._id,
                    }))
            );
            setFilteredProducts(mappedProducts);
            console.log(mappedProducts)
            setShowDropdown(true);
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    };

    // Use lodash debounce to prevent rapid API calls
    const debouncedFetchProducts = useCallback(
        _.debounce((query: string) => fetchFilteredProducts(query), 300),  // Debounce with a 300ms delay
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
        const query = e.target.value;
        setInputValue(query);
    };

    const handleProductSelect = (product: any) => {
        // Include parent product information when calling onChange
        onChange({
            ...product,
            parent_id: product.parent_id,  // Ensure parent_id is included
            parentName: product.parentName,
        });
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
            {showDropdown && <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {loading ? (
                    <li className="flex justify-center items-center py-2">
                        <FaSpinner className="animate-spin text-indigo-500" />
                    </li>
                ) : filteredProducts.length > 0 ? filteredProducts.map(product => (
                    <li
                        key={product._id}
                        onClick={() => handleProductSelect(product)}
                        className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                    >
                        {product.name} (ID: {product.ID})  {product.SKU} | {product.parentName} {product.name} | 
                    </li>
                )) : value.length < 4 ? <li className="px-4 py-2">Enter 4 characters to start searching</li> : <li className="px-4 py-2">No Products Found</li>
                }
            </ul>
            }



        </div>
    );
};

export default AutocompleteProductInput;
