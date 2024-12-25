import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function InspectionTemplate() {
    const { propertyId } = useParams();
    const [addressDetails, setAddressDetails] = useState(null);

    useEffect(() => {
        const fetchAddress = async () => {
            const apiPort = process.env.REACT_APP_DB_PORT || 8080;
            const endpoint = `http://localhost:${apiPort}/api/get-address/${propertyId}`;
            try {
                const response = await axios.get(endpoint);
                if (response.status === 200) {
                    setAddressDetails(response.data);
                }
            } catch (error) {
                console.error('Error fetching address:', error.response?.data || error.message);
            }
        };

        fetchAddress();
    }, [propertyId]);

    if (!addressDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Inspection Template</h1>
            <p><strong>Street:</strong> {addressDetails.street}</p>
            <p><strong>City:</strong> {addressDetails.city}</p>
            <p><strong>State:</strong> {addressDetails.state}</p>
            <p><strong>Postal Code:</strong> {addressDetails.postal_code}</p>
            <p><strong>Country:</strong> {addressDetails.country}</p>
            {/* Add other inspection template fields here */}
        </div>
    );
}

export default InspectionTemplate;
