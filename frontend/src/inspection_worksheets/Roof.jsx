import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Roof = () => {
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
  } = InspectionCRUD(inspectionId, "roof");

  const items = useMemo(() => [
    {
      name: "Roof Covering",
      materials: ["Asphalt Shingles", "Metal", "Tile", "Slate", "Other (see comments)"],
      condition: ["Worn", "Missing Shingles", "Cracked", "Ponding", "Multiple Layers"],
    },
    {
      name: "Flashing",
      materials: ["Metal", "Rubber", "Plastic", "Other (see comments)"],
      condition: ["Damaged", "Loose", "Improperly Installed", "Corroded", "Missing"],
    },
    {
      name: "Gutters",
      materials: ["Aluminum", "Copper", "Vinyl", "Steel", "Other (see comments)"],
      condition: ["Clogged", "Leaking", "Detached", "Improper Slope", "Missing Sections"],
    },
    {
      name: "Downspouts",
      materials: ["Aluminum", "Copper", "Vinyl", "Steel", "Other (see comments)"],
      condition: ["Disconnected", "Leaking", "Improper Termination", "Crushed", "Blocked"],
    },
    {
      name: "Skylights",
      materials: ["Glass", "Plastic", "Acrylic", "Other (see comments)"],
      condition: ["Leaking", "Cracked", "Hazy", "Improper Flashing", "Broken Seal"],
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

export default Roof;