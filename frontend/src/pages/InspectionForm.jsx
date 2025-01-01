import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "../styles/InspectionForm.css";

const InspectionForm = () => {
    const { formId, propertyId, worksheetId } = useParams(); // propertyId may be used for advanced API logic
    const navigate = useNavigate();
    const [WorksheetComponent, setWorksheetComponent] = useState(null);
    const [inspectionData, setInspectionData] = useState({});
    const apiEndpoint = `http://localhost:8080/api/inspection/${formId}?propertyId=${propertyId}`; // API endpoint for fetching data

    useEffect(() => {
        if (!formId) {
            console.error("Form ID is missing!");
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
    }, [formId, apiEndpoint, navigate]);

    useEffect(() => {
        // Determine the active worksheet
        const activeWorksheet = worksheetId || inspectionData.defaultWorksheet || "CoverPage";

        import(`../inspection_worksheets/${activeWorksheet}.jsx`)
            .then((module) => setWorksheetComponent(() => module.default))
            .catch((error) => {
                console.error("Worksheet not found:", error);
                setWorksheetComponent(() => () => <div>Worksheet not found</div>);
            });
    }, [worksheetId, inspectionData]);

    const handleFieldChange = async (field, value) => {
        // Update local state
        setInspectionData((prevData) => ({ ...prevData, [field]: value }));

        // Persist changes to the backend
        try {
            await axios.put(apiEndpoint, { [field]: value });
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
