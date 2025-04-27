import React from "react";
import "../styles/InspectionAnalysis.css";
import "../styles/InspectionAnalysisCard.css";

const getSeverityClass = (severity) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "severity critical";
    case "major":
      return "severity major";
    case "moderate":
      return "severity moderate";
    case "minor":
      return "severity minor";
    default:
      return "severity";
  }
};

const InspectionAnalysisCard = ({ section }) => {
  // Each section is already a block of text
  const lines = section.split("\n").map(line => line.trim()).filter(Boolean);

  const titleLine = lines[0] || "";
  const details = lines.slice(1);

  const severityMatch = titleLine.match(/\*\*Severity:\*\* (.+)/i);
  const titleMatch = titleLine.match(/\*\*(.+)\*\*/);

  const severity = severityMatch ? severityMatch[1].trim() : "";
  const title = titleMatch ? titleMatch[1].trim() : "Issue";

  return (
    <div className="analysis-card">
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {severity && <span className={getSeverityClass(severity)}>{severity}</span>}
      </div>
      <div className="card-body">
        {details.map((detail, idx) => (
          <p key={idx} className="card-detail">{detail.replace(/\*\*/g, "").replace(/^- /, "")}</p>
        ))}
      </div>
    </div>
  );
};

export default InspectionAnalysisCard;
