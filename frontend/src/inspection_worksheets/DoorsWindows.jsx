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
    updateComponentTypeConditions,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "doorsWindows");

  const items = useMemo(() => [
    {
      name: "Exterior Doors",
      label: "Exterior Door Type",
      componentTypes: ["Wood", "Metal", "Fiberglass", "Glass", "Sliding", "Other (see comments)"],
      condition: ["Operational", "Damaged", "Loose", "Weatherstripping Missing", "Locks Defective", "Normal Wear"],
    },
    {
      name: "Interior Doors",
      label: "Interior Door Type",
      componentTypes: ["Wood", "Hollow Core", "Solid Core", "Glass", "Other (see comments)"],
      condition: ["Operational", "Damaged", "Misaligned", "Normal Wear"],
    },
    {
      name: "Windows",
      label: "Window Type",
      componentTypes: ["Single Hung", "Double Hung", "Casement", "Slider", "Awning", "Fixed", "Other (see comments)"],
      condition: ["Operational", "Broken Glass", "Sticking", "Failed Seal", "Screen Damaged", "Normal"],
    },
    {
      name: "Garage Doors",
      label: "Garage Door Type",
      componentTypes: ["Sectional", "Roll-Up", "One-Piece Tilt-Up", "Carriage Style", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Damaged Panels", "Springs Defective", "No Safety Reversal"],
    },
    {
      name: "Garage Door Openers",
      label: "Opener Type",
      componentTypes: ["Chain Drive", "Belt Drive", "Screw Drive", "Direct Drive", "Jackshaft", "Other (see comments)"],
      condition: ["Operational", "Not Operational", "Auto-Reverse Not Functional", "Remote Missing"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">10. DOORS & WINDOWS</h1>
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

export default DoorsWindows;
