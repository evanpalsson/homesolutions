import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const BasementFoundation = () => {
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
  } = InspectionCRUD(inspectionId, "basementFoundation");

  const items = useMemo(() => [
    {
      name: "Foundation Walls",
      materials: ["Concrete", "Block", "Brick", "Stone", "Other (see comments)"],
      condition: ["Cracked", "Efflorescence", "Leaking", "Bow/Bulge", "Settlement Signs"],
    },
    {
      name: "Floor Structure",
      materials: ["Concrete", "Wood Joists", "Steel Beams", "Other (see comments)"],
      condition: ["Sagging", "Water Damage", "Termite Damage", "Rotting", "Loose Joists"],
    },
    {
      name: "Support Posts & Columns",
      materials: ["Steel", "Wood", "Concrete", "Other (see comments)"],
      condition: ["Rusting", "Shifting", "Improper Support", "Rotting", "Unstable Base"],
    },
    {
      name: "Basement Windows",
      materials: ["Glass Block", "Single Pane", "Double Pane", "Other (see comments)"],
      condition: ["Cracked", "Leaking", "Hazy Glass", "Broken Locks", "Water Stains"],
    },
    {
      name: "Sump Pump",
      materials: ["Present", "Operational", "Battery Backup", "None"],
      condition: ["Operational", "Not Working", "Missing Cover", "Clogged", "Disconnected"],
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

export default BasementFoundation;