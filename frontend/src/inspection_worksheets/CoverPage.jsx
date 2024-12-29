import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/InspectionForm.css';

function CoverPage() {
    const { propertyId } = useParams();
    const [addressDetails, setAddressDetails] = useState(null);
    const [buildingType, setBuildingType] = useState(""); // State for dropdown
    const [inspectionDate, setInspectionDate] = useState(() => {
        // Default to today's date in YYYY-MM-DD format
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [yearBuilt, setYearBuilt] = useState(""); // State for Year Built dropdown

    // Generate years from 1900 to current year
    const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i).reverse();

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
        <>
        <div>
            <div className="container">
                <h1>GENERAL INFO</h1>
                <div className="info-section">
                    <div className="info-item">
                        <strong>Property Address</strong>
                        <p>{addressDetails.street}<br />{addressDetails.city}, {addressDetails.state} {addressDetails.postal_code}</p>
                    </div>
                    <div className="info-item">
                        <strong>Date of Inspection</strong>
                        <input
                            type="date"
                            value={inspectionDate}
                            onChange={(e) => setInspectionDate(e.target.value)}
                        />
                    </div>
                    <div className="info-item">
                        <strong>Property ID</strong>
                        <p>{addressDetails.property_id}</p>
                    </div>
                </div>
                <h1>INSPECTION DETAILS</h1>
                <div className="info-section">
                    <div className="info-item">
                        <strong>In Attendance:</strong>
                        <p>Customer and their agent</p>
                    </div>
                    <div className="info-item">
                        <strong>Type of building:</strong>
                        <select
                            value={buildingType}
                            onChange={(e) => setBuildingType(e.target.value)}
                        >
                            <option value="" disabled>Select type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Mixed-Use">Mixed-Use</option>
                        </select>
                    </div>
                    <div className="info-item">
                        <strong>Year Built:</strong>
                        <select
                            value={yearBuilt}
                            onChange={(e) => setYearBuilt(e.target.value)}
                        >
                            <option value="" disabled>Select year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="info-section">
                    <div className="info-item">
                        <strong>Outside Temperature:</strong>
                        <p>Over 65 (F)</p>
                    </div>
                    <div className="info-item">
                        <strong>Weather:</strong>
                        <p>Clear</p>
                    </div>
                    <div className="info-item">
                        <strong>Ground/Soil surface condition:</strong>
                        <p>Dry</p>
                    </div>
                </div>
                <div className="info-section">
                    <div className="info-item">
                        <strong>Rain in last 3 days:</strong>
                        <p>No</p>
                    </div>
                    <div className="info-item">
                        <strong>Radon Test:</strong>
                        <p>Yes</p>
                    </div>
                    <div className="info-item">
                        <strong>Mold Test:</strong>
                        <p>No</p>
                    </div>
                </div>

                <h1>COMMENT KEY & DEFINITIONS</h1>
                <div className="info-section">
                    <div className="info-item">
                        <strong>Comment Key or Definitions</strong>
                        <p>The following definitions of comment descriptions represent this inspection report. All comments by the inspector should be considered before purchasing this home. Any recommendations by the inspector to repair or replace suggests a second opinion or further inspection by a qualified contractor. All costs associated with further inspection fees and repair or replacement of item, component or unit should be considered before you purchase the property.</p>
                        <p>Inspected (IN) = I visually observed the item, component or unit and if no other comments were made then it appeared to be functioning as intended allowing for normal wear and tear.</p>
                        <p>Not Inspected (NI) = I did not inspect this item, component or unit and made no representations of whether or not it was functioning as intended and will state a reason for not inspecting.</p>
                        <p>Not Present (NP) = This item, component or unit is not in this home or building.</p>
                        <p>Repair or Replace (RR) = The item, component or unit is not functioning as intended, or needs further inspection by a qualified contractor. Items, components or units that can be repaired to satisfactory condition may not need replacement.</p>
                    </div>
                </div>
            </div>
        </div></>



    );
}

export default CoverPage;
