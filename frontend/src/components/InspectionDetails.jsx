import React, { useEffect, useState, useRef, memo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/InspectionForm.css';

function InspectionDetails() {
    const { propertyId, inspectionId } = useParams();
    const [inspectionDetails, setInspectionDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        const fetchInspectionDetails = async () => {
            if (!propertyId || !inspectionId) {
                setErrorMessage('Property ID and Inspection ID are required.');
                setIsLoading(false);
                return;
            }
    
            const apiPort = process.env.REACT_APP_DB_PORT || 8080;
            const endpoint = `http://localhost:${apiPort}/api/inspection-details/${inspectionId}/${propertyId}`;
    
            setIsLoading(true); // Start loading
            try {
                const response = await axios.get(endpoint);
                if (response.status === 200) {
                    setInspectionDetails(response.data);
                    setErrorMessage('');
                }
            } catch (error) {
                console.error("Failed to fetch inspection details:", error.message);
                setErrorMessage('Failed to load inspection details. Please try again later.');
            } finally {
                setIsLoading(false); // Stop loading
            }
        };
    
        fetchInspectionDetails();
    }, [propertyId, inspectionId]);
    
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const updateBackend = async (updatedDetails) => {
        const apiPort = process.env.REACT_APP_DB_PORT || 8080;
        const endpoint = `http://localhost:${apiPort}/api/update-inspection`;
        try {
            await axios.put(endpoint, updatedDetails);
        } catch (error) {
            console.error('Error updating inspection details:', error.response?.data || error.message);
        }
        console.log("Sending update to backend:", updatedDetails);
    };

    const debouncedUpdate = debounce(updateBackend, 500);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedDetails = {
            ...inspectionDetails,
            [name]: type === 'checkbox'
                ? checked
                : name === 'temperature'
                    ? (value === '' ? null : Number(value))
                    : (value === '' ? null : value),
            inspection_id: inspectionId,
        };        
        setInspectionDetails(updatedDetails);
        debouncedUpdate(updatedDetails);
    };    

    if (isLoading) {
        return <div>Loading inspection details...</div>;
    }
    
    if (errorMessage) {
        return <div>{errorMessage}</div>;
    }    

    return (
        <div className="container">
            <h1>INSPECTION DETAILS</h1>
            <div className="info-section">
                <div className="info-item">
                    <strong>Date of Inspection:</strong>
                    <input
                        type="date"
                        name="inspection_date"
                        value={inspectionDetails.inspection_date || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="info-item">
                    <strong>Temperature (°F):</strong>
                    <input
                        type="number"
                        name="temperature"
                        value={inspectionDetails.temperature || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="info-item">
                    <strong>Weather:</strong>
                    <select
                        name="weather"
                        value={inspectionDetails.weather || ''}
                        onChange={handleInputChange}
                    >
                        <option value="" disabled>Select weather</option>
                        <option value="Clear">Clear</option>
                        <option value="Cloudy">Cloudy</option>
                        <option value="Rainy">Rainy</option>
                        <option value="Snowy">Snowy</option>
                    </select>
                </div>
                <div className="info-item">
                    <strong>Ground Condition:</strong>
                    <select
                        name="ground_condition"
                        value={inspectionDetails.ground_condition || ''}
                        onChange={handleInputChange}
                    >
                        <option value="" disabled>Select condition</option>
                        <option value="Dry">Dry</option>
                        <option value="Wet">Wet</option>
                        <option value="Muddy">Muddy</option>
                    </select>
                </div>
                <div className="info-item item-checkbox">
                    <strong>Mold Test Conducted:</strong>  
                    <label className="toggle-switch">
                        <input
                        type="checkbox"
                        name="mold_test"
                        checked={inspectionDetails.mold_test || false}
                        onChange={handleInputChange}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
                <div className="info-item item-checkbox">
                    <strong>Radon Test Conducted:</strong>
                    <label className="toggle-switch">
                        <input
                        type="checkbox"
                        name="radon_test"
                        checked={inspectionDetails.radon_test || false}
                        onChange={handleInputChange}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
                <div className="info-item item-checkbox">
                    <strong>Rain in Last 3 Days:</strong>
                    <label className="toggle-switch">
                        <input
                        type="checkbox"
                        name="rain_last_three_days"
                        checked={inspectionDetails.rain_last_three_days || false}
                        onChange={handleInputChange}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default memo(InspectionDetails);
