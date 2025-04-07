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
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "fireplace");

  const items = useMemo(() => [
    {
      name: "Fireplace Type",
      materials: ["Wood Burning", "Gas", "Electric", "Pellet", "Other (see comments)"],
      condition: ["Operational", "Inoperable", "Excessive Creosote", "Draft Issues"],
    },
    {
      name: "Chimney - Vent",
      materials: ["Masonry", "Metal", "Direct Vent", "Power Vent", "Other (see comments)"],
      condition: ["Clear", "Blocked", "Damaged Flue", "Needs Cleaning"],
    },
    {
      name: "Damper",
      materials: ["Present", "Missing", "Inoperable", "Other (see comments)"],
      condition: ["Operational", "Stuck", "Missing", "Broken Handle"],
    },
    {
      name: "Firebox",
      materials: ["Brick", "Steel", "Cast Iron", "Other (see comments)"],
      condition: ["Good", "Cracked", "Leaking", "Corroded"],
    },
    {
      name: "Hearth",
      materials: ["Tile", "Stone", "Concrete", "Other (see comments)"],
      condition: ["Intact", "Cracked", "Loose", "Missing Tiles"],
    },
  ], []);

  return (
    <div>
      <h1>10. FIREPLACE</h1>
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

export default Fireplace;
