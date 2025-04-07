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
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "attic");

  const items = useMemo(() => [
    {
      name: "Access",
      materials: ["Scuttle", "Stairs", "Walk-up", "Other (see comments)"],
      condition: ["Safe", "Unsafe", "Obstructed", "Damaged"],
    },
    {
      name: "Structure",
      materials: ["Rafters", "Trusses", "Joists", "Beams", "Other (see comments)"],
      condition: ["Intact", "Cracked", "Sagging", "Modified"],
    },
    {
      name: "Ventilation",
      materials: ["Soffit", "Ridge", "Gable", "Fan", "Other (see comments)"],
      condition: ["Adequate", "Inadequate", "Blocked", "None"],
    },
    {
      name: "Insulation",
      materials: ["Fiberglass Batts", "Blown-in", "Foam Board", "None", "Other (see comments)"],
      condition: ["Evenly Distributed", "Compressed", "Missing", "Wet"],
    },
    {
      name: "Moisture Intrusion",
      materials: ["Stains", "Mold", "Leaks", "None", "Other (see comments)"],
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
        }}
      />
    </div>
  );
};

export default Attic;
