import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Fireplace = () => {
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
  } = InspectionCRUD(inspectionId, "fireplace");

  const items = useMemo(() => [
    {
      name: "Fireplaces and Stoves",
      label: "Fireplace/Stove Type",
      componentTypes: ["Wood-Burning Fireplace", "Gas Fireplace", "Pellet Stove", "Wood Stove", "Electric Fireplace", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Damaged Firebox", "Cracked Masonry", "Creosote Buildup", "Normal"],
    },
    {
      name: "Chimneys and Vents",
      label: "Chimney/Vent Type",
      componentTypes: ["Masonry Chimney", "Metal Chimney", "Direct Vent", "B-Vent", "Other (see comments)"],
      condition: ["Blocked", "Damaged", "Leaning", "Cracked Flue", "Normal"],
    },
    {
      name: "Hearths and Mantels",
      label: "Hearth/Mantel Material",
      componentTypes: ["Stone", "Brick", "Tile", "Wood", "Other (see comments)"],
      condition: ["Cracked", "Damaged", "Loose", "Normal"],
    },
    {
      name: "Damper Operation",
      label: "Damper Type",
      componentTypes: ["Manual", "Top-Sealing", "Missing", "Other (see comments)"],
      condition: ["Operational", "Stuck", "Damaged", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1>14. FIREPLACE, WOOD STOVE, CHIMNEY</h1>
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

export default Fireplace;
