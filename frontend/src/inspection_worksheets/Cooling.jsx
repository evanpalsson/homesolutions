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
      name: "Distribution",
      materials: ["Ductwork", "Wall Unit", "Ceiling Unit", "Portable", "Other (see comments)"],
      condition: ["Even Airflow", "Blocked Vents", "Leaking Ducts", "Disconnected"],
    },
    {
      name: "Thermostat",
      materials: ["Manual", "Programmable", "Smart", "Zoned", "Other (see comments)"],
      condition: ["Functional", "Non-functional", "Incorrect Calibration", "No Display"],
    },
    {
      name: "Cooling Source",
      materials: ["Electric", "Gas", "Solar", "Other (see comments)"],
      condition: ["Connected", "Disconnected", "Improper Installation", "Unknown"],
    },
    {
      name: "Ventilation",
      materials: ["Attic Fan", "Exhaust Fan", "Whole House Fan", "Natural", "Other (see comments)"],
      condition: ["Adequate", "Blocked", "Noisy", "None"],
    },
  ], []);

  return (
    <div>
      <h1>3. BASEMENT & FOUNDATION</h1>
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