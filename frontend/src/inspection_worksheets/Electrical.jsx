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
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "electrical");

  const items = useMemo(() => [
    {
      name: "Service Panel",
      materials: ["Circuit Breakers", "Fuses", "Subpanel", "Main Panel", "Other (see comments)"],
      condition: ["Properly Labeled", "Overloaded", "Double Taps", "Loose Connections"],
    },
    {
      name: "Wiring",
      materials: ["Copper", "Aluminum", "Knob & Tube", "BX", "Romex", "Other (see comments)"],
      condition: ["Exposed", "Damaged Insulation", "Outdated", "Improper Splices"],
    },
    {
      name: "Outlets & Switches",
      materials: ["GFCI", "AFCI", "Ungrounded", "Three-prong", "Other (see comments)"],
      condition: ["Functional", "Hot to Touch", "Ungrounded", "Loose"],
    },
    {
      name: "Lighting",
      materials: ["Ceiling", "Wall-mounted", "Recessed", "Track", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Flickering", "Missing Bulbs"],
    },
    {
      name: "Smoke and CO Detectors",
      materials: ["Smoke", "CO", "Combo Unit", "Battery-powered", "Hardwired"],
      condition: ["Present", "Expired", "Missing", "Not Functional"],
    },
  ], []);

  return (
    <div>
      <h1>8. ATTIC</h1>
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
        }}
      />
    </div>
  );
};

export default Electrical;
