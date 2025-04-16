import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/InspectionAnalysis.css";  // (create styling as needed)

const InspectionAnalysis = () => {
  const { inspectionId, propertyId } = useParams();
  const location = useLocation();
  const [analysisText, setAnalysisText] = useState("");

  useEffect(() => {
    // If navigated from HomeInspectionReport, we might have analysis in state (optional)
    if (location.state && location.state.analysis) {
      setAnalysisText(location.state.analysis);
      return;
    }
    // Otherwise, fetch from API
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`/api/inspection-analysis/${inspectionId}`);
        if (res.data && res.data.analysisText) {
          setAnalysisText(res.data.analysisText);
        } else {
          setAnalysisText("No analysis available for this inspection.");
        }
      } catch (err) {
        console.error("Failed to fetch analysis:", err);
        setAnalysisText("Error loading analysis.");
      }
    };
    fetchAnalysis();
  }, [inspectionId, location.state]);

  return (
    <div className="analysis-page">
      <h1>Inspection Analysis</h1>
      {analysisText ? (
        // Use <pre> or styled div to preserve formatting of the analysis text
        <pre className="analysis-content">{analysisText}</pre>
      ) : (
        <p>Loading analysis...</p>
      )}
      <div className="analysis-actions">
        <Link to={`/property/${propertyId}/inspection/${inspectionId}`}>
          &#8592; Back to Report
        </Link>
        {/* (In the future, a Download PDF button could be added here) */}
      </div>
    </div>
  );
};

export default InspectionAnalysis;
