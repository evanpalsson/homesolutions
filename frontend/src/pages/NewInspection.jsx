import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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

    // Old handling
    // const handleSubmitAddress = async () => {
    //     const apiPort = process.env.REACT_APP_DB_PORT || 8080; // Fallback to 8080 if not defined
    //     const endpoint = `http://localhost:${apiPort}/api/save-address`; // Add 'http://'
    //     console.log("Sending payload:", addressDetails);

    //     try {
    //         const response = await axios.post(endpoint, addressDetails);
    //         if (response.status === 200) {
    //             console.log('Address saved successfully!');
    //             const propertyId = response.data.property_id; // Assuming property_id is returned in the response
    //             navigate(`/inspection-form/${propertyId}/CoverPage`);
    //         }
    //     } catch (error) {
    //         console.error('Error saving address:', error.response?.data || error.message);
    //     }
    // };

    // new handling
    // const handleSubmitAddress = async () => {
    //     const apiPort = process.env.REACT_APP_DB_PORT || 8080;
    //     const saveAddressEndpoint = `http://localhost:${apiPort}/api/save-address`;
    //     const createInspectionEndpoint = `http://localhost:${apiPort}/api/create-inspection`;
    
    //     try {
    //         // Save the address
    //         const addressResponse = await axios.post(saveAddressEndpoint, addressDetails);
    //         if (addressResponse.status === 200) {
    //             console.log('Address saved successfully!');
    //             const propertyId = addressResponse.data.property_id;
    
    //             // Create an inspection form
    //             const payload = {
    //                 property_id: propertyId,
    //                 inspection_date: new Date().toISOString().split('T')[0], // Example date
    //                 form_data: { initialField: 'defaultValue' }, // Example JSON data
    //             };
    //             const inspectionResponse = await axios.post(createInspectionEndpoint, payload);
    //             if (inspectionResponse.status === 200) {
    //                 console.log('Inspection form created successfully!');
    //                 const formId = inspectionResponse.data.form_id;
    
    //                 // Navigate to the inspection form
    //                 navigate(`/inspection-form/${formId}/CoverPage`);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error processing request:', error.response?.data || error.message);
    //     }
    // };
    
    // newer handling
    const handleSubmitAddress = async () => {
        const apiPort = process.env.REACT_APP_DB_PORT || 8080;
        const saveAddressEndpoint = `http://localhost:${apiPort}/api/save-address`;
        const createInspectionEndpoint = `http://localhost:${apiPort}/api/create-inspection`;
    
        try {
            // Save the address
            const addressResponse = await axios.post(saveAddressEndpoint, addressDetails);
            if (addressResponse.status === 200) {
                console.log('Address saved successfully!');
                const propertyId = addressResponse.data.property_id;
    
                // Create an inspection form
                const payload = {
                    property_id: propertyId,
                    inspection_date: new Date().toISOString().split('T')[0], // Use current date as a valid default
                    form_data: {}, // Empty object for now; can be populated with initial data
                };
    
                console.log('Payload for inspection form:', payload);
    
                const inspectionResponse = await axios.post(createInspectionEndpoint, payload);
                if (inspectionResponse.status === 200) {
                    console.log('Inspection form created successfully!');
                    const formId = inspectionResponse.data.form_id;
    
                    // Navigate to the inspection form and default to CoverPage
                    navigate(`/inspection-form/${formId}/${propertyId}/CoverPage`);
                    console.log("Navigating to CoverPage:", { formId, propertyId });

                }
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
