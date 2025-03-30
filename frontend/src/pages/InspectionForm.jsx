import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/InspectionSidebar";
import axios from "axios";
import "../styles/InspectionForm.css";

const InspectionForm = () => {
    const { inspectionId, propertyId, worksheetId } = useParams(); // propertyId may be used for advanced API logic
    const navigate = useNavigate();
    const [WorksheetComponent, setWorksheetComponent] = useState(null);
    const [inspectionData, setInspectionData] = useState({});
    const apiEndpoint = `http://localhost:8080/api/inspection-details/${inspectionId}/${propertyId}`;

    useEffect(() => {
        if (!inspectionId) {
            console.error("Inspection ID is missing!");
            navigate("/error"); // Redirect to an error page or fallback route
            return;
        }

        // Fetch initial inspection data
        const fetchInspectionData = async () => {
            try {
                const response = await axios.get(apiEndpoint);
                if (response.status === 200) {
                    setInspectionData(response.data);
                }
            } catch (error) {
                console.error("Error fetching inspection data:", error.message);
            }
        };

        fetchInspectionData();
    }, [inspectionId, apiEndpoint, navigate]);

    useEffect(() => {
        // Determine the active worksheet
        const activeWorksheet = worksheetId || inspectionData.defaultWorksheet || "HomeDetails";

        import(`../inspection_worksheets/${activeWorksheet}.jsx`)
            .then((module) => setWorksheetComponent(() => module.default))
            .catch((error) => {
                console.error("Worksheet not found:", error);
                setWorksheetComponent(() => () => <div>Worksheet not found</div>);
            });
    }, [worksheetId, inspectionData]);

    const handleFieldChange = async (field, value) => {
        const updatedData = {
            ...inspectionData,
            [field]: value,
            inspection_id: inspectionId, // Include inspection_id
        };
    
        setInspectionData(updatedData);
    
        try {
            await axios.put(apiEndpoint, updatedData);
        } catch (error) {
            console.error("Error updating inspection data:", error.message);
        }
    };    

    if (!WorksheetComponent) {
        return <div>Loading worksheet...</div>;
    }

    return (
        <div className="inspection-form-container">
            <Sidebar />
            <div className="inspection-content">
                <WorksheetComponent
                    inspectionData={inspectionData}
                    propertyId={propertyId}
                    onFieldChange={handleFieldChange}
                />
            </div>
        </div>
    );
};

export default InspectionForm;
