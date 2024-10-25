import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Location as InvLocation } from '../config/models/supplier';
import { inventoryApi } from '../config/apiRoutes/inventoryApi';

interface AutocompleteLocationProps {
  onSelect: (location: InvLocation) => void;
  value: InvLocation | undefined;
}

const AutocompleteLocation: React.FC<AutocompleteLocationProps> = ({ onSelect, value }) => {
  const [query, setQuery] = useState<string>(value ? value.name : '');
  const [locations, setLocations] = useState<InvLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<InvLocation[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await inventoryApi.getAllInvLocations();

        if (!response.status) {
          toast.error(response.err ?? "Something went wrong while fetching list of locations");
        } else {
          const data = response.data;
          const locationData: InvLocation[] = data
          setLocations(locationData);
          setFilteredLocations(locationData);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error('Failed to fetch locations');
      }
    };
    fetchLocations();
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
    setQuery(event.target.value);
    setIsOpen(true);

    let filtered = locations.filter((location) =>
      location.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
      location.emailID.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  const handleSelect = (location: InvLocation) => {
    setQuery(location.name);
    setIsOpen(false);
    onSelect(location);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        disabled={locations.length < 1}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
        value={query}
        onChange={handleInputChange}
        onClick={() => setIsOpen(true)}
        placeholder={`${locations.length > 0 ? "Search Inventory locations" : "No Inventory Locations found"}`}
      />
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredLocations.map((location, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(location)}
            >
              {location.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteLocation;