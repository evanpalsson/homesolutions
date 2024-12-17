import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { GoogleMap, useJsApiLoader, GoogleSearchBox } from '@react-google-maps/api'
// import { useRef } from 'react';
import '../styles/InspectionForm.css';

// function GoogleMapsComponent() {
//     const inputref = useRef(null)
//     const { isLoaded } = useJsApiLoader({
//       id: 'google-map-script',
//       googleMapsApiKey: ProcessingInstruction.env.GOOGLEMAPS_API_KEY,
//       libraries: ["places"]
//     })

// console.log(isLoaded)

const InspectionForm = () => {
    const [propertySearch, setPropertySearch] = useState('');
    const [propertySuggestions, setPropertySuggestions] = useState([]);
    const [inspectors, setInspectors] = useState([]);
    const [formData, setFormData] = useState({
        property_id: '',
        inspector_id: '',
        inspection_date: '',
        notes: '',
    });

    // Fetch inspectors on component mount
    useEffect(() => {
        axios.get('/api/users?type=inspector')
            .then(response => setInspectors(response.data))
            .catch(error => console.error('Error fetching inspectors:', error));
    }, []);

    // Handle property search input changes
    const handlePropertySearch = (e) => {
        const value = e.target.value;
        setPropertySearch(value);

        if (value.trim() !== '') {
            axios.get(`/api/properties/search?query=${value}`)
                .then(response => setPropertySuggestions(response.data))
                .catch(error => console.error('Error fetching property suggestions:', error));
        } else {
            setPropertySuggestions([]);
        }
    };

    // Handle selecting a property from suggestions
    const handleSelectProperty = (property) => {
        setFormData({
            ...formData,
            property_id: property.id,
        });
        setPropertySearch(`${property.address}, ${property.city}, ${property.state}`);
        setPropertySuggestions([]);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('/api/inspections', formData)
            .then(response => {
                alert('Inspection added successfully!');
                setFormData({
                    property_id: '',
                    inspector_id: '',
                    inspection_date: '',
                    notes: '',
                });
                setPropertySearch('');
            })
            .catch(error => console.error('Error adding inspection:', error));
    };

    // const handleOnPlacesChanged = () => {
    //     let address = inputref.current.getPlaces()
    //     console.log("address", address)
    // }

    return (
        <div className="inspection-form-container">
            <h2>Add New Inspection</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    {/* {isLoaded &&
                    <GoogleSearchBox
                        onLoad={(ref) => inputref.current = ref}
                        onPlacesChange={handleOnPlacesChanged}
                    > */}
                    <label htmlFor="property_search">Property</label>
                    <input
                        type="text"
                        name="property_search"
                        value={propertySearch}
                        onChange={handlePropertySearch}
                        placeholder="Search for a property"
                        required
                    />
                    {/* </GoogleSearchBox>
                    } */}
                    {propertySuggestions.length > 0 && (
                        <ul className="property-suggestions">
                            {propertySuggestions.map(property => (
                                <li
                                    key={property.id}
                                    onClick={() => handleSelectProperty(property)}
                                >
                                    {property.address}, {property.city}, {property.state}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="inspector_id">Inspector</label>
                    <select
                        name="inspector_id"
                        value={formData.inspector_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select an Inspector</option>
                        {inspectors.map(inspector => (
                            <option key={inspector.id} value={inspector.id}>
                                {inspector.name} ({inspector.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inspection_date">Inspection Date</label>
                    <input
                        type="date"
                        name="inspection_date"
                        value={formData.inspection_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};


export default InspectionForm;
