import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Cooling = () => {
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
  } = InspectionCRUD(inspectionId, "cooling");

  const items = useMemo(() => [
    {
      name: "Cooling System",
      materials: ["Central Air", "Ductless Mini-Split", "Window Unit", "Evaporative Cooler", "Other (see comments)"],
      condition: ["Operational", "Leaking", "No Cool Air", "Excessive Noise"],
    },
    {
      name: "Cooling Source",
      materials: ["Electric", "Gas", "Solar", "Other (see comments)"],
      condition: ["Connected", "Disconnected", "Improper Installation", "Unknown"],
    },
  ], []);

  return (
    <div>
      <h1>5. COOLING</h1>
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

export default Cooling;