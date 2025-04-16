import React from "react";

const InspectionAnalysisCard = ({ section }) => (
    <div
      className="analysis-card"
      style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif" }}
    >
      {section}
    </div>
  );
  

export default InspectionAnalysisCard;
