import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Color } from '../config/models/color';
import { productApis } from '../config/apiRoutes/productRoutes';


interface AutocompleteColorProps {
    onSelect: (color: Color) => void;
    value: Color | undefined;
}

const AutocompleteColor: React.FC<AutocompleteColorProps> = ({ onSelect, value }) => {
    const [query, setQuery] = useState(value ? value.name : '');
    const [colors, setColors] = useState<Color[]>([]);
    const [filteredColors, setFilteredColors] = useState<Color[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await productApis.GetColors();
                if (response.status) {
                    const data = response.data.filter((col:Color)=>col.status==="ACTIVE");
                    setColors(data);
                    setFilteredColors(data);
                }
            } catch (error) {
                console.error('Error fetching colors:', error);
                toast.error('Failed to fetch colors');
            }
        };

        fetchColors();
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
        const filtered = colors.filter((color) =>
            color.name.toLowerCase().includes(value.toLowerCase()) ||
            color.hexCode.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredColors(filtered);
    };

    const handleSelect = (color: Color) => {
        setQuery(color.name);
        setIsOpen(false);
        onSelect(color);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={colors.length > 0 ? "Search colors by name or hex code" : "No colors found"}
                className="w-full p-2 border rounded"
            />
            {isOpen && filteredColors.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {filteredColors.map((color, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(color)}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        >
                            <div
                                className="w-6 h-6 mr-2 border border-gray-300 rounded"
                                style={{ backgroundColor: color.hexCode }}
                            ></div>
                            {color.name} ({color.hexCode})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteColor;