import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Category, subCategory } from '../config/models/category';  // Assuming subCategory and Category are models
import { productApis } from '../config/apiRoutes/productRoutes';

interface AutocompleteSubCategoryProps {
    category: Category | undefined;
    onSelect: (subCategory: subCategory) => void;
    value: subCategory | undefined;
}

const AutocompleteSubCategory: React.FC<AutocompleteSubCategoryProps> = ({ category, onSelect, value }) => {
    const [query, setQuery] = useState(value ? value.name : '');
    const [subCategories, setSubCategories] = useState<subCategory[]>([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState<subCategory[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (category) {
            const fetchSubCategories = async () => {
                try {
                    const response = await productApis.GetsubCategories(category._id);
                    if (response.status) {
                        const data = response.data.filter((subCat: subCategory) => subCat.status === "ACTIVE");
                        setSubCategories(data);
                        setFilteredSubCategories(data);
                    }
                } catch (error) {
                    console.error('Error fetching subcategories:', error);
                    toast.error('Failed to fetch subcategories');
                }
            };

            fetchSubCategories();
        }
    }, [category]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        setIsOpen(true);
        const filtered = subCategories.filter((subCategory) =>
            subCategory.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSubCategories(filtered);
    };

    const handleSelect = (subCategory: subCategory) => {
        setQuery(subCategory.name);
        setIsOpen(false);
        onSelect(subCategory);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={subCategories.length > 0 ? "Search subcategories" : "No subcategories found"}
                className="w-full p-2 border rounded"
                disabled={!category}  // Disable input when no category is selected
            />
            {isOpen && filteredSubCategories.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {filteredSubCategories.map((subCategory, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(subCategory)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {subCategory.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteSubCategory;
