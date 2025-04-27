import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Plumbing = () => {
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
  } = InspectionCRUD(inspectionId, "plumbing");

  const items = useMemo(() => [
    {
      name: "Water Supply Piping",
      label: "Supply Piping Material",
      componentTypes: ["Copper", "CPVC", "PEX", "Galvanized Steel", "Polybutylene", "Other (see comments)"],
      condition: ["Properly Installed", "Corroded", "Leaking", "Disconnected", "Normal"],
    },
    {
      name: "Drain, Waste, and Vent Piping",
      label: "Drainage Piping Material",
      componentTypes: ["PVC", "ABS", "Cast Iron", "Galvanized", "Copper", "Other (see comments)"],
      condition: ["Proper Slope", "Leaking", "Corroded", "Blocked", "Normal"],
    },
    {
      name: "Water Heater",
      label: "Water Heater Type",
      componentTypes: ["Tank", "Tankless", "Gas", "Electric", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Leaking", "No Expansion Tank", "Normal Wear"],
    },
    {
      name: "Fixtures and Faucets",
      label: "Fixture/Faucet Type",
      componentTypes: ["Toilet", "Sink", "Bathtub", "Shower", "Other (see comments)"],
      condition: ["Operational", "Leaking", "Clogged", "Loose", "Normal"],
    },
    {
      name: "Sump Pump and Drainage",
      label: "Sump Pump System",
      componentTypes: ["Submersible Pump", "Pedestal Pump", "Battery Backup", "Water Powered Backup", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Clogged", "Switch Failure", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">7. PLUMBING SYSTEMS</h1>
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

export default Plumbing;
