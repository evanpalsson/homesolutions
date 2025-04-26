import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import "../styles/InspectionWorksheets.css";

const Heating = () => {
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
  } = InspectionCRUD(inspectionId, "heating");

  const items = useMemo(() => [
    {
      name: "Heating Equipment",
      label: "Heating Equipment Type",
      componentTypes: ["Furnace", "Boiler", "Heat Pump", "Wall Heater", "Radiant Floor", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Noisy", "Leaking", "Normal Wear", "Major Defects"],
    },
    {
      name: "Distribution Systems",
      label: "Heat Distribution Type",
      componentTypes: ["Ductwork", "Radiant Panels", "Radiators", "Baseboard Units", "Other (see comments)"],
      condition: ["Leaking", "Disconnected", "Obstructed", "Insulation Missing", "Normal"],
    },
    {
      name: "Venting Systems",
      label: "Venting System Type",
      componentTypes: ["Metal Flue", "PVC Flue", "Chimney Flue", "Direct Vent", "Other (see comments)"],
      condition: ["Properly Vented", "Improperly Vented", "Blocked", "Corroded", "Normal"],
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
      <h1>13. HEATING SYSTEMS</h1>
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

export default Heating;
