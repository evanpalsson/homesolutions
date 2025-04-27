import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Electrical = () => {
  const { inspectionId } = useParams();
  const {
    formData,
    handleCheckboxChange,
    handleCommentChange,
    handleStatusChange,
    handleResize,
    handlePhotoUpload,
    handlePhotoRemove,
    updateComponentTypeConditions,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "electrical");

  const items = useMemo(() => [
    {
      name: "Service Entrance",
      label: "Service Entrance Type",
      componentTypes: ["Overhead", "Underground", "Other (see comments)"],
      condition: ["Secure", "Loose", "Damaged", "Corroded", "Normal"],
    },
    {
      name: "Main Panel",
      label: "Main Panel Type",
      componentTypes: ["Breaker Panel", "Fuse Panel", "Subpanel", "Combination Panel", "Other (see comments)"],
      condition: ["Operational", "Corrosion", "Missing Covers", "Improper Wiring", "Normal"],
    },
    {
      name: "Branch Wiring",
      label: "Branch Wiring Type",
      componentTypes: ["Copper", "Aluminum", "Knob and Tube", "BX Cable", "Romex", "Other (see comments)"],
      condition: ["Properly Installed", "Double Tapped", "Damaged", "Loose", "Normal"],
    },
    {
      name: "Outlets and Fixtures",
      label: "Outlet/Fixture Type",
      componentTypes: ["Standard Outlets", "GFCI Outlets", "AFCI Protection", "Lighting Fixtures", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Reversed Polarity", "Ungrounded", "Normal"],
    },
    {
      name: "Grounding & Bonding",
      label: "Grounding System Type",
      componentTypes: ["Rod Ground", "Water Pipe Ground", "Other (see comments)"],
      condition: ["Proper", "Improper", "Missing", "Loose", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">12. ELECTRICAL SYSTEMS</h1>
      <InspectionSections
        items={items}
        formData={formData}
        photos={photos}
        fetchPhotos={fetchPhotos}
        handlers={{
          handleCheckboxChange,
          handleCommentChange,
          handleStatusChange,
          handleResize,
          handlePhotoUpload,
          handlePhotoRemove,
          updateComponentTypeConditions,
        }}
      />
    </div>
  );
};

export default Electrical;
