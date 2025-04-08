import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import '../styles/NewInspection.css';

const libraries = ['places'];

// Test the API
// const testAPI = async () => { // remove once api fixed
//     const apiPort = process.env.REACT_APP_DB_PORT || 8080;
//     const endpoint = `http://localhost:${apiPort}/api/save-address`;
//     const addressDetails1 = {
//         street: '',
//         city: '',
//         state: '',
//         postal_code: '',
//         postal_code_suffix: '',
//         country: ''
//     };

//     try {
//         const response = await axios.post(endpoint, addressDetails1);
//         if (response.status === 200) {
//             console.log('API connected. Address saved successfully!');
//         }
//     } catch (error) {
//         console.error('API not connected. Error saving address:', error.response?.data || error.message);
//     }
// };

// Call the test function
// testAPI();

function NewInspection() {
    const history = useHistory();
    const inputref = useRef(null);
    const [addressDetails, setAddressDetails] = useState({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        postal_code_suffix: '',
        country: ''
    });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    const handleOnPlacesChanged = () => {
        const places = inputref.current.getPlaces();
        if (places && places[0]) {
            const place = places[0];
            const addressComponents = place.address_components;
    
            const getAddressComponent = (type, useShortName = false) =>
                addressComponents.find((component) =>
                    component.types.includes(type)
                )?.[useShortName ? 'short_name' : 'long_name'] || '';
    
            const streetNumber = getAddressComponent('street_number');
            const route = getAddressComponent('route');
            const fullStreet = `${streetNumber} ${route}`.trim(); // Combine street_number and route
        
            setAddressDetails({
                street: fullStreet,
                city: getAddressComponent('locality'),
                state: getAddressComponent('administrative_area_level_1', true), // Use short_name for state
                postal_code: getAddressComponent('postal_code'),
                postal_code_suffix: getAddressComponent('postal_code_suffix'),
                country: getAddressComponent('country', true), // Use short_name for country
            });
        }
    };

    useEffect(() => {
        const inputElement = document.getElementById('address-validation-input');
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                console.log('Enter key pressed');
                // Add any action you'd like to trigger here
            }
        };

        if (inputElement) {
            inputElement.addEventListener('keypress', handleKeyPress);
        }

        // Cleanup the event listener on component unmount
        return () => {
            if (inputElement) {
                inputElement.removeEventListener('keypress', handleKeyPress);
            }
        };
    }, []);

    if (!isLoaded) {
        return 'LOADING...';
    }

    const handleSubmitAddress = async () => {
        const apiPort = process.env.REACT_APP_DB_PORT || 8080;
        const saveAddressEndpoint = `http://localhost:${apiPort}/api/save-address`;
    
        try {
            const response = await axios.post(saveAddressEndpoint, addressDetails);
            if (response.status === 200) {
                const { property_id, inspection_id } = response.data;
    
                history.push(`/inspection-form/${inspection_id}/${property_id}/HomeDetails`);
                console.log("Navigating to HomeDetails:", { inspection_id, property_id });
            }
        } catch (error) {
            console.error('Error processing request:', error.response?.data || error.message);
        }
    };
    
    return (
        <div style={{ marginTop: '10%', textAlign: 'center' }} id="address-validation-container">
            {isLoaded && (
                <StandaloneSearchBox
                    onLoad={(ref) => (inputref.current = ref)}
                    onPlacesChanged={handleOnPlacesChanged}
                >
                    <input
                        id="address-validation-input"
                        className='address-validation-container'
                        type="text"
                        name="property_search"
                        placeholder="Search for a property"
                        required
                    />
                </StandaloneSearchBox>
            )}
            <div className="address-details">
                <input
                    type="text"
                    value={addressDetails.street}
                    placeholder="Street Address"
                    readOnly
                />
                <input
                    type="text"
                    value={addressDetails.city}
                    placeholder="City"
                    readOnly
                />
                <input
                    type="text"
                    value={addressDetails.state}
                    placeholder="State"
                    readOnly
                />
                <input
                    type="text"
                    value={`${addressDetails.postal_code || ''}${addressDetails.postal_code && addressDetails.postal_code_suffix ? '-' : ''}${addressDetails.postal_code_suffix || ''}`}
                    placeholder="Zip Code"
                    readOnly
                />
                <input
                    type="text"
                    value={addressDetails.country}
                    placeholder="Country"
                    readOnly
                />
            </div>
            <button onClick={handleSubmitAddress}>Save Address</button>
        </div>
    );
}

export default NewInspection;
