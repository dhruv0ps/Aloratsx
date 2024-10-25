import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Category } from '../config/models/category';
import { productApis } from '../config/apiRoutes/productRoutes';

interface AutocompleteCategoryProps {
    onSelect: (category: Category) => void;
    value: Category | undefined;
}

const AutocompleteCategory: React.FC<AutocompleteCategoryProps> = ({ onSelect, value }) => {
    const [query, setQuery] = useState(value ? value.name : '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {

                const response = await productApis.GetCategories();
                if (response.status) {

                    const data = response.data.filter((cat: Category) => cat.status === "ACTIVE")
                    setCategories(data);
                    setFilteredCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

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
        const filtered = categories.filter((category) =>
            category.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
    };

    const handleSelect = (category: Category) => {
        setQuery(category.name);
        setIsOpen(false);
        onSelect(category);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={categories.length > 0 ? "Search categories" : "No categories found"}
                className="w-full p-2 border rounded"
            />
            {isOpen && filteredCategories.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {filteredCategories.map((category, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(category)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteCategory;