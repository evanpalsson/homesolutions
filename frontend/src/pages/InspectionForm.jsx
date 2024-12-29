import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Adjust the path based on your file structure
import "../styles/InspectionForm.css"; // Optional: Add a CSS file for layout

const InspectionForm = () => {
  const { worksheetId } = useParams();
  const [WorksheetComponent, setWorksheetComponent] = useState(null);

  useEffect(() => {
    // Dynamically import the JSX component based on the worksheetId
    import(`../inspection_worksheets/${worksheetId}.jsx`)
      .then((module) => setWorksheetComponent(() => module.default))
      .catch((error) => {
        console.error("Worksheet not found:", error);
        setWorksheetComponent(() => () => <div>Worksheet not found</div>);
      });
  }, [worksheetId]);

  if (!WorksheetComponent) {
    return <div>Loading worksheet...</div>;
  }

  return (
    <div className="inspection-form-container">
      <Sidebar />
      <div className="inspection-content">
        <WorksheetComponent />
      </div>
    </div>
  );
};

export default InspectionForm;
