import React, { useState, useEffect, useRef } from 'react';
import { ApprovedDealer as Dealer } from '../config/models/dealer';
import { dealerApis } from '../config/apiRoutes/dealerRoutes';

interface AutoCompleteDealerInputProps {
    value: string;
    onChange: (dealer: Dealer) => void;
}

const AutoCompleteDealerInput: React.FC<AutoCompleteDealerInputProps> = ({ value, onChange }) => {
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value || "");
        fetchDealers();
    }, []);

    const fetchDealers = async () => {
        try {
            const response = await dealerApis.getAllApprovedDealers();
            if (response.status) {
                setDealers(response.data);
                setFilteredDealers(response.data.filter((dealer: Dealer) => dealer.status === "ACTIVE"));
            }
        } catch (error: any) {
            console.log(error);
            // toast.error(error.response?.data.err.toString() ?? error.message.toString());
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
        const queryValue = e.target.value.toLowerCase();
        setShowDropdown(true);

        const filtered = dealers.filter(dealer =>
            dealer.companyName.toLowerCase().includes(queryValue) ||
            dealer.contactPersonName.toLowerCase().includes(queryValue) ||
            dealer.contactPersonEmail.toLowerCase().includes(queryValue)
        );
        setFilteredDealers(filtered);
        setQuery(queryValue);
    };

    const handleDealerSelect = (dealer: Dealer) => {
        onChange(dealer);
        setQuery(dealer.contactPersonName);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by company name, contact name, or email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
            />
            {showDropdown && filteredDealers.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredDealers.map(dealer => (
                        <li
                            key={dealer._id}
                            onClick={() => handleDealerSelect(dealer)}
                            className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                        >
                            {dealer.companyName} - {dealer.contactPersonName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoCompleteDealerInput;