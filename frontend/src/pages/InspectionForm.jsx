import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Adjust the path based on your file structure
import axios from "axios";
import "../styles/InspectionForm.css"; // Optional: Add a CSS file for layout

const InspectionForm = () => {
  const { worksheetId } = useParams();
  const [WorksheetComponent, setWorksheetComponent] = useState(null);
  const [inspectionData, setInspectionData] = useState({});
  const apiEndpoint = `http://localhost:8080/api/inspection/${worksheetId}`;

  useEffect(() => {
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
  }, [apiEndpoint, worksheetId]);

  useEffect(() => {
    // Dynamically import the JSX component based on the worksheetId
    import(`../inspection_worksheets/${worksheetId}.jsx`)
      .then((module) => setWorksheetComponent(() => module.default))
      .catch((error) => {
        console.error("Worksheet not found:", error);
        setWorksheetComponent(() => () => <div>Worksheet not found</div>);
      });
  }, [worksheetId]);

  const handleFieldChange = async (field, value) => {
    setInspectionData((prevData) => ({ ...prevData, [field]: value }));

    // Persist data to the database
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
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
};

export default InspectionForm;
