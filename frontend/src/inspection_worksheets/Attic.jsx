import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Attic = () => {
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
  } = InspectionCRUD(inspectionId, "attic");

  const items = useMemo(() => [
    {
      name: "Access",
      label: "Access Type",
      componentTypes: ["Scuttle", "Stairs", "Walk-up", "Other (see comments)"],
      condition: ["Safe", "Unsafe", "Obstructed", "Damaged"],
    },
    {
      name: "Structure",
      label: "Framing Type",
      componentTypes: ["Rafters", "Trusses", "Joists", "Beams", "Other (see comments)"],
      condition: ["Intact", "Cracked", "Sagging", "Modified"],
    },
    {
      name: "Ventilation",
      label: "Ventilation Type",
      componentTypes: ["Soffit", "Ridge", "Gable", "Fan", "Other (see comments)"],
      condition: ["Adequate", "Inadequate", "Blocked", "None"],
    },
    {
      name: "Insulation",
      label: "Insulation Type",
      componentTypes: ["Fiberglass Batts", "Blown-in", "Foam Board", "None", "Other (see comments)"],
      condition: ["Evenly Distributed", "Compressed", "Missing", "Wet"],
    },
    {
      name: "Moisture Intrusion",
      label: "Signs Observed",
      componentTypes: ["Stains", "Mold", "Leaks", "None", "Other (see comments)"],
      condition: ["Active", "Past", "Dry", "Unknown"],
    },
  ], []);

  return (
    <div>
      <h1>8. ATTIC</h1>
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

export default Attic;
