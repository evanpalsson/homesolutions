import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const DoorsWindows = () => {
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
  } = InspectionCRUD(inspectionId, "doorsWindows");

  const items = useMemo(() => [
    {
      name: "Exterior Doors",
      materials: ["Wood", "Steel", "Fiberglass", "Glass", "Other (see comments)"],
      condition: ["Misaligned", "Weathered", "Broken Seal", "Drafty"],
    },
    {
      name: "Interior Doors",
      materials: ["Hollow Core", "Solid Wood", "Glass Panel", "Other (see comments)"],
      condition: ["Sticking", "Loose Hinges", "Damaged", "Does Not Latch"],
    },
    {
      name: "Windows",
      materials: ["Single Pane", "Double Pane", "Vinyl", "Wood", "Other (see comments)"],
      condition: ["Operational", "Broken", "Fogged", "Leaking"],
    },
    {
      name: "Skylights",
      materials: ["Fixed", "Ventilated", "Glass", "Plastic", "Other (see comments)"],
      condition: ["Clear", "Leaking", "Cracked", "Cloudy"],
    },
    {
      name: "Storm Doors - Windows",
      materials: ["Aluminum", "Wood", "Vinyl", "Other (see comments)"],
      condition: ["Installed", "Missing", "Non-functional", "Damaged"],
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

export default DoorsWindows;
