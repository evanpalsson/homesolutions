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
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "heating");

  const items = useMemo(() => [
    {
      name: "Heating System",
      materials: ["Forced Air", "Boiler/Radiator", "Electric Baseboard", "Heat Pump", "Other (see comments)"],
      condition: ["Operational", "No Heat", "Leaking", "Noisy Operation"],
    },
    {
      name: "Fuel Type",
      materials: ["Natural Gas", "Electric", "Oil", "Propane", "Wood", "Other (see comments)"],
      condition: ["Connected", "Disconnected", "Leak Suspected", "Unknown"],
    },
    {
      name: "Distribution",
      materials: ["Ductwork", "Radiators", "Baseboards", "Floor Heating", "Other (see comments)"],
      condition: ["Even Heating", "Cold Spots", "Leaking Pipes", "Air Locked"],
    },
    {
      name: "Thermostat",
      materials: ["Manual", "Programmable", "Smart", "Zoned", "Other (see comments)"],
      condition: ["Functional", "Non-functional", "Inaccurate", "Unresponsive"],
    },
  ], []);

  return (
    <div>
      <h1>4. HEATING</h1>
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

export default Heating;