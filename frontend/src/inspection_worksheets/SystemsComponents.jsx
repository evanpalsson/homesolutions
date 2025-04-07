import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const SystemsComponents = () => {
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
  } = InspectionCRUD(inspectionId, "systemsComponents");

  const items = useMemo(() => [
    {
      name: "Garage Door",
      materials: ["Chain Drive", "Belt Drive", "Screw Drive", "Direct Drive", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Reversing Issues", "No Remote"],
    },
    {
      name: "Ceiling Fans",
      materials: ["Wood Blades", "Metal Blades", "Remote Control", "Other (see comments)"],
      condition: ["Balanced", "Wobbly", "Noisy", "Inoperable"],
    },
    {
      name: "Central Vacuum",
      materials: ["Installed", "Wall Inlets", "Accessories Present", "Other (see comments)"],
      condition: ["Operational", "Clogged", "Low Suction", "Leaking"],
    },
    {
      name: "Doorbell",
      materials: ["Wired", "Wireless", "Video", "Other (see comments)"],
      condition: ["Functional", "No Sound", "Delayed", "Disconnected"],
    },
    {
      name: "Intercom",
      materials: ["Audio Only", "Video", "Room-to-Room", "Other (see comments)"],
      condition: ["Operational", "Static", "Unclear Audio", "Non-functional"],
    },
  ], []);

  return (
    <div>
      <h1>11. SYSTEMS & COMPONENTS</h1>
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

export default SystemsComponents;