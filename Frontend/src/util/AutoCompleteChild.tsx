import React, { useState, useEffect, useRef } from 'react';
import { Child } from '../config/models/Child';
import { productApis } from '../config/apiRoutes/productRoutes';

interface AutocompleteChildInputProps {
    productId: string;
    value: string;
    setInputValue: (value: string) => void;
    onChange: (child: Child) => void;
}

const AutocompleteChildInput: React.FC<AutocompleteChildInputProps> = ({ productId, value, onChange, setInputValue }) => {
    const [children, setChildren] = useState<Child[]>([]);
    const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchChildren();
    }, [productId]);

    const fetchChildren = async () => {
        try {
            const response = await productApis.getProductById(productId);
            const data = response.data;
            const childrenData: Child[] = data.children.filter((child: Child) => child.status !== "OUT OF STOCK");
            setChildren(childrenData);
            setFilteredChildren(childrenData);
        } catch (error: any) {
            console.log(error);
        }
    };

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

        const filtered = children.filter(child =>
            `${child.name} ${child.color} ${child.SKU}`.toLowerCase().includes(query)
        );

        setFilteredChildren(filtered);
    };

    const handleChildSelect = (child: Child) => {
        onChange(child);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type to search child product"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
            />
            {showDropdown && filteredChildren.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredChildren.map(child => (
                        <li
                            key={child.SKU}
                            onClick={() => handleChildSelect(child)}
                            className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                        >
                            {child.name} - {child.color.name} | (SKU: {child.SKU})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteChildInput;