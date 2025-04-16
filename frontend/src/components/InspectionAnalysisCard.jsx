import React, { useState } from "react";
import "../styles/InspectionAnalysisCard.css";

const InspectionAnalysisCard = ({ section }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(prev => !prev);

  return (
    <div className={`analysis-card severity-${section.severity.toLowerCase()}`}>
      <div className="card-header" onClick={toggleOpen}>
        <h2>{section.title}</h2>
        <span>{isOpen ? "−" : "+"}</span>
      </div>

      {isOpen && (
        <div className="card-body">
          <p><strong>Issue:</strong> {section.issue}</p>
          <p><strong>Severity:</strong> <span className="severity">{section.severity}</span></p>
          <p><strong>DIY Estimate:</strong> {section.diyEstimate}</p>
          <p><strong>Professional Estimate:</strong> {section.proEstimate}</p>
          <p><strong>Estimated Remaining Life:</strong> {section.remainingLife}</p>
          {section.youtubeSearch && (
            <p>
              <strong>DIY Tutorial:</strong>{" "}
              <a href={section.youtubeSearch} target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionAnalysisCard;
