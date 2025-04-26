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
    updateComponentTypeConditions,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "basementFoundation");

  const items = useMemo(() => [
    {
      name: "Foundation Walls",
      label: "Wall Construction Type",
      componentTypes: ["Poured Concrete", "Concrete Block", "Stone", "Brick", "Wood", "Other (see comments)"],
      condition: ["Cracked", "Bulging", "Leaking", "Efflorescence", "Damaged", "Normal"],
    },
    {
      name: "Floors",
      label: "Floor Construction Type",
      componentTypes: ["Concrete", "Wood", "Tile", "Other (see comments)"],
      condition: ["Cracked", "Settled", "Uneven", "Moisture", "Normal"],
    },
    {
      name: "Support Beams and Columns",
      label: "Support Type",
      componentTypes: ["Steel", "Wood", "Masonry", "Adjustable Columns", "Other (see comments)"],
      condition: ["Rust", "Rot", "Damaged", "Modified", "Normal"],
    },
    {
      name: "Basement Insulation",
      label: "Insulation Type",
      componentTypes: ["None", "Fiberglass", "Foam Board", "Spray Foam", "Other (see comments)"],
      condition: ["Intact", "Compressed", "Missing", "Wet"],
    },
    {
      name: "Moisture Intrusion",
      label: "Signs Observed",
      componentTypes: ["Stains", "Mold", "Efflorescence", "Leaks", "None", "Other (see comments)"],
      condition: ["Active", "Past", "Dry", "Unknown"],
    },
  ], []);

  return (
    <div>
      <h1>9. BASEMENT / FOUNDATION</h1>
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

export default BasementFoundation;
