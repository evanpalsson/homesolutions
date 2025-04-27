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
    updateComponentTypeConditions,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "roof");

  const items = useMemo(() => [
    {
      name: "Roof Coverings",
      label: "Roof Covering Material",
      componentTypes: ["Asphalt Shingles", "Metal", "Clay Tile", "Slate", "Wood Shingles", "Membrane (EPDM/TPO)", "Other (see comments)"],
      condition: ["Cracked", "Missing", "Curled", "Granule Loss", "Leaks", "Normal Wear"],
    },
    {
      name: "Flashing",
      label: "Flashing Material",
      componentTypes: ["Metal", "Rubber Boot", "Lead", "Copper", "Other (see comments)"],
      condition: ["Properly Installed", "Damaged", "Rusty", "Missing", "Normal"],
    },
    {
      name: "Gutters",
      label: "Gutter Material",
      componentTypes: ["Aluminum", "Vinyl", "Steel", "Copper", "Other (see comments)"],
      condition: ["Leaking", "Detached", "Blocked", "Rust", "Normal"],
    },
    {
      name: "Downspouts",
      label: "Downspout Material",
      componentTypes: ["Aluminum", "Vinyl", "Steel", "Copper", "Other (see comments)"],
      condition: ["Disconnected", "Damaged", "Blocked", "Normal"],
    },
    {
      name: "Skylights, Chimneys, and Roof Penetrations",
      label: "Roof Penetration Type",
      componentTypes: ["Skylight", "Chimney", "Vent Pipe", "Solar Panel Mounts", "Other (see comments)"],
      condition: ["Leaking", "Cracked", "Improper Flashing", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">5. ROOF SYSTEM</h1>
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

export default Roof;
