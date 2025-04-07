import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Plumbing = () => {
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
  } = InspectionCRUD(inspectionId, "plumbing");

  const items = useMemo(() => [
    {
      name: "Water Supply",
      materials: ["Copper", "PEX", "PVC", "Galvanized Steel", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Leaking"],
    },
    {
      name: "Drain, Waste & Vent (DWV)",
      materials: ["ABS", "PVC", "Cast Iron", "Copper", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Leaking"],
    },
    {
      name: "Water Heater",
      materials: ["Tank", "Tankless", "Electric", "Gas", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Leaking", "Corroded"],
    },
    {
      name: "Fuel Source",
      materials: ["Natural Gas", "Propane", "Electric", "Solar", "Other (see comments)"],
      condition: ["Connected", "Disconnected", "Unknown"],
    },
    {
      name: "Fixtures",
      materials: ["Sink", "Toilet", "Shower", "Bathtub", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Leaking", "Clogged"],
    },
  ], []);

  return (
    <div>
      <h1>6. PLUMBING</h1>
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

export default Plumbing;
