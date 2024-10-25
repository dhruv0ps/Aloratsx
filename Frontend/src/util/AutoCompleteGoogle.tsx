import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Address } from '../config/models/address';

const libraries: ('places')[] = ['places'];

const AutocompleteInput: React.FC<{ address?: string, onChange: (place: Address) => void }> = ({ address, onChange }) => {
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isServiceAvailable, setIsServiceAvailable] = useState(true);


    useEffect(() => {
        if (inputRef.current) {
            try {
                autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                    types: ['geocode'],
                });

                inputRef.current.value = address ?? "";

                autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current!.getPlace();
                    if (place.geometry) {
                        const address = place.formatted_address ?? "";
                        const latitude = place.geometry.location?.lat().toString() ?? "";
                        const longitude = place.geometry.location?.lng().toString() ?? "";
                        const userAddress = { address, latitude, longitude }
                        onChange(userAddress);
                    } else {
                        console.error("No details available for input: '" + place.name + "'");
                    }
                });
            } catch (error) {
                console.error("Google Maps API is not available.");
                setIsServiceAvailable(false);
            }
        }
    }, [address, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <div>
            <input
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                ref={inputRef}
                type="text"
                placeholder={isServiceAvailable ? "Enter a location" : "Service unavailable"}
                style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                disabled={!isServiceAvailable}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

const AutoCompleteAddress: React.FC<{ address?: string, onChange: (place: Address) => void }> = ({ address, onChange }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_KEY,
        libraries: libraries,
    });

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return <AutocompleteInput address={address ?? ""} onChange={onChange} />;
};

export default AutoCompleteAddress;
