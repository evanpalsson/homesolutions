import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import InspectionAnalysisCard from "./InspectionAnalysisCard";

const InspectionAnalysis = () => {
  const { inspectionId } = useParams();
  const location = useLocation();
  const propertyId = location.state?.propertyId;

  const [analysis, setAnalysis] = useState([]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`/inspection-analysis/${inspectionId}`);
        setAnalysis(res.data); // Ensure this data is in the right format!
      } catch (err) {
        console.error("Failed to load analysis:", err);
      }
    };

    fetchAnalysis();
  }, [inspectionId]);

  return (
    <div className="analysis-page">
      <h1>Inspection Analysis Report</h1>
      {analysis.length > 0 ? (
        analysis.map((section, idx) => (
          <InspectionAnalysisCard key={idx} section={section} />
        ))
      ) : (
        <p>No analysis available for this inspection.</p>
      )}
    </div>
  );
};

export default InspectionAnalysis;
