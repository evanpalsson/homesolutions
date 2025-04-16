import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InspectionAnalysisCard from "./InspectionAnalysisCard";

const InspectionAnalysis = () => {
  const { inspectionId } = useParams();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    console.log("🔍 Inspection ID:", inspectionId);

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/inspection-analysis/${inspectionId}`);
        const data = await res.json();

        const analysisText = data.analysisText;
        console.log("🧠 Raw analysis:", analysisText);

        const parsed = parseAnalysisText(analysisText);
        setCards(parsed);
      } catch (err) {
        console.error("❌ Failed to load analysis:", err);
      }
    };

    if (inspectionId) {
      fetchAnalysis();
    }
  }, [inspectionId]);

  return (
    <div className="analysis-page">
      <h1>Inspection Analysis Report</h1>
      {cards.length > 0 ? (
        cards.map((section, idx) => (
          <InspectionAnalysisCard key={idx} section={section} />
        ))
      ) : (
        <p>No analysis available for this inspection.</p>
      )}
    </div>
  );
};

// Very basic parser: separates text by double newlines
const parseAnalysisText = (text) => {
  const sections = text.split("\n\n").filter(Boolean);
  return sections.map((block) => block.trim());
};

export default InspectionAnalysis;
