import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Exterior = () => {
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
  } = InspectionCRUD(inspectionId, "exterior");

  const items = useMemo(() => [
    {
      name: "Siding, Flashing, and Trim",
      label: "Exterior Wall Covering Type",
      componentTypes: ["Wood", "Vinyl", "Aluminum", "Fiber Cement", "Brick Veneer", "Stone Veneer", "Stucco", "Other (see comments)"],
      condition: ["Cracked", "Peeling", "Rot", "Loose", "Damaged", "Normal Wear"],
    },
    {
      name: "Eaves, Soffits, and Fascia",
      label: "Soffit/Fascia Material",
      componentTypes: ["Wood", "Aluminum", "Vinyl", "Fiber Cement", "Other (see comments)"],
      condition: ["Peeling", "Rot", "Missing", "Damaged", "Normal"],
    },
    {
      name: "Porches, Balconies, Decks, and Steps",
      label: "Porch/Deck Material",
      componentTypes: ["Wood", "Composite", "Concrete", "Stone", "Other (see comments)"],
      condition: ["Rot", "Loose Railings", "Settling", "Cracked", "Normal"],
    },
    {
      name: "Driveways, Walkways, and Patios",
      label: "Pavement/Surface Type",
      componentTypes: ["Concrete", "Asphalt", "Pavers", "Stone", "Gravel", "Other (see comments)"],
      condition: ["Cracked", "Settled", "Heaved", "Surface Wear", "Normal"],
    },
    {
      name: "Vegetation, Grading, Drainage",
      label: "Site Feature Type",
      componentTypes: ["Overhanging Trees", "Negative Grading", "Drainage Swales", "Retaining Walls", "Other (see comments)"],
      condition: ["Proper", "Improper", "Blocked", "Damaged", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">6. EXTERIOR</h1>
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

export default Exterior;
