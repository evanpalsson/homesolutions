import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Cooling = () => {
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
  } = InspectionCRUD(inspectionId, "cooling");

  const items = useMemo(() => [
    {
      name: "Cooling Equipment",
      label: "Cooling Equipment Type",
      componentTypes: ["Central AC", "Ductless Mini-Split", "Window Unit", "Evaporative Cooler", "Other (see comments)"],
      condition: ["Operational", "Not Operational", "Leaking", "Noisy", "Normal Wear", "Major Defects"],
    },
    {
      name: "Distribution Systems",
      label: "Cooling Distribution Type",
      componentTypes: ["Ductwork", "Radiant Systems", "Other (see comments)"],
      condition: ["Leaking", "Disconnected", "Obstructed", "Insulation Missing", "Normal"],
    },
    {
      name: "Thermostats",
      label: "Thermostat Type",
      componentTypes: ["Programmable", "Non-Programmable", "Smart Thermostat", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Not Responsive", "Wired Incorrectly"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">11. COOLING SYSTEMS</h1>
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

export default Cooling;
