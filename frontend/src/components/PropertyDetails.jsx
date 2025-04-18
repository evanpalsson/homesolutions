import React, { useEffect, useState, memo } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../utils/axios";
import '../styles/InspectionForm.css';

function PropertyDetails() {
    const { propertyId, inspectionId } = useParams();
    const [addressDetails, setAddressDetails] = useState(null);
    const [propertyDetails, setPropertyDetails] = useState({
        property_id: propertyId,
        year_built: "",
        square_footage: "",
        bedrooms: "",
        bathrooms: "",
        lot_size: "",
        property_type: "",
    });

    const [photoURL, setPhotoURL] = useState(null);
    const [reportId, setReportId] = useState(null);
    const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i).reverse();

    useEffect(() => {
        const apiPort = process.env.REACT_APP_DB_PORT || 8080;

        const fetchData = async () => {
            try {
                const [addressRes, propertyRes, photoRes, reportRes] = await Promise.all([
                    axios.get(`http://localhost:${apiPort}/api/get-address/${propertyId}`),
                    axios.get(`http://localhost:${apiPort}/api/property-details/${propertyId}/${inspectionId}`),
                    axios.get(`http://localhost:${apiPort}/api/property-photo/${inspectionId}`),
                    axios.get(`http://localhost:${apiPort}/api/inspection-details/${inspectionId}/${propertyId}`)
                ]);

                if (addressRes.status === 200) setAddressDetails(addressRes.data);
                if (propertyRes.status === 200) setPropertyDetails(prev => ({ ...prev, ...propertyRes.data }));
                if (photoRes.data?.length > 0) setPhotoURL(`http://localhost:${apiPort}${photoRes.data[0].photo_url}`);
                if (reportRes.status === 200 && reportRes.data?.report_id) setReportId(reportRes.data.report_id);

            } catch (err) {
                console.error("Error fetching initial data:", err.response?.data || err.message);
            }
        };

        if (propertyId && inspectionId) fetchData();
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
        const formattedPayload = formatPayload(updatedDetails);
        try {
            await axios.put(`http://localhost:${apiPort}/api/property-details`, formattedPayload);
        } catch (error) {
            console.error("Error updating property details:", error.response?.data || error.message);
        }
    };

    const debouncedUpdate = debounce(updateBackend, 500);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedDetails = { ...propertyDetails, [name]: value };
        setPropertyDetails(updatedDetails);
        debouncedUpdate(updatedDetails);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadPhoto = async () => {
            const apiPort = process.env.REACT_APP_DB_PORT || 8080;
            const formData = new FormData();
            formData.append("photo", file);

            try {
                const response = await axios.post(
                    `http://localhost:${apiPort}/api/property-photo/${inspectionId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                if (response.status === 200 && response.data?.photo_url) {
                    setPhotoURL(`http://localhost:${apiPort}${response.data.photo_url}`);
                }
            } catch (err) {
                console.error("Upload failed:", err.response?.data || err.message);
            }
        };

        uploadPhoto();
    };

    const handleDelete = async () => {
        const apiPort = process.env.REACT_APP_DB_PORT || 8080;
        try {
            await axios.delete(`http://localhost:${apiPort}/api/property-photo/${inspectionId}`);
            setPhotoURL(null);
        } catch (error) {
            console.error("Delete failed:", error.response?.data || error.message);
        }
    };

    const formatPayload = (details) => ({
        property_id: details.property_id,
        year_built: details.year_built ? parseInt(details.year_built, 10) : null,
        square_footage: details.square_footage ? parseInt(details.square_footage, 10) : null,
        bedrooms: details.bedrooms ? parseInt(details.bedrooms, 10) : null,
        bathrooms: details.bathrooms ? parseFloat(details.bathrooms) : null,
        lot_size: details.lot_size ? parseFloat(details.lot_size) : null,
        property_type: details.property_type,
    });

    if (!addressDetails || !propertyDetails) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>PROPERTY DETAILS</h1>
            <div className="info-section">
                <div className="info-item">
                    <strong>Property Address</strong>
                    <p>{addressDetails.street}<br />{addressDetails.city}, {addressDetails.state} {addressDetails.postal_code}</p>
                </div>
                <div className="info-item">
                    <strong>Report#</strong>
                    <p>{reportId || "Loading..."}</p>
                </div>
                <div className="info-item">
                    <strong>Year Built:</strong>
                    <select name="year_built" value={propertyDetails.year_built ?? ""} onChange={handleInputChange}>
                        <option value="" disabled>Select year</option>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div className="info-item">
                    <strong>Size (sqft):</strong>
                    <input type="number" name="square_footage" value={propertyDetails.square_footage ?? ""} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                    <strong>Bedrooms:</strong>
                    <input type="number" name="bedrooms" value={propertyDetails.bedrooms ?? ""} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                    <strong>Bathrooms:</strong>
                    <input type="number" name="bathrooms" value={propertyDetails.bathrooms ?? ""} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                    <strong>Lot Size (acres):</strong>
                    <input type="number" step="0.01" name="lot_size" value={propertyDetails.lot_size ?? ""} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                    <strong>Property Type:</strong>
                    <select name="property_type" value={propertyDetails.property_type ?? ""} onChange={handleInputChange}>
                        <option value="" disabled>Select type</option>
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Mixed-Use">Mixed-Use</option>
                    </select>
                </div>

                <div className="info-item">
                    <strong>Upload Property Photo:</strong>
                    {!photoURL && (
                        <input type="file" accept="image/*" onChange={handlePhotoChange} />
                    )}
                    {photoURL && (
                        <div style={{ marginTop: "10px" }}>
                            <img
                                src={photoURL}
                                alt="Property"
                                style={{ maxWidth: "225px", height: "auto" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/placeholder.png";
                                }}
                            />
                            <button
                                style={{
                                    backgroundColor: "#4a90e2",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 20px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    width: "100%",
                                    marginTop: "10px"
                                }}
                                onClick={handleDelete}
                            >
                                Delete Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(PropertyDetails);
