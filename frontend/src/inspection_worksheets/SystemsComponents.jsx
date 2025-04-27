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
    updateComponentTypeConditions,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "systemsComponents");

  const items = useMemo(() => [
    {
      name: "Installed Appliances",
      label: "Appliance Type",
      componentTypes: ["Range/Oven", "Cooktop", "Dishwasher", "Microwave", "Trash Compactor", "Garbage Disposal", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Damaged", "Normal Wear"],
    },
    {
      name: "Smoke and Carbon Monoxide Detectors",
      label: "Detector Type",
      componentTypes: ["Smoke Detector", "Carbon Monoxide Detector", "Combination Unit", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Missing", "Expired", "Normal"],
    },
    {
      name: "Exhaust Systems",
      label: "Exhaust System Type",
      componentTypes: ["Bathroom Fan", "Range Hood", "Laundry Exhaust", "Attic Fan", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Noisy", "Blocked", "Normal"],
    },
    {
      name: "Central Vacuum Systems",
      label: "Central Vacuum Type",
      componentTypes: ["Hard Piping", "Flexible Hose", "Power Unit", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Clogged", "Damaged", "Normal"],
    },
    {
      name: "Intercom and Security Systems",
      label: "System Type",
      componentTypes: ["Intercom", "Alarm", "Cameras", "Doorbell Camera", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Wiring Issues", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">15. SYSTEMS AND COMPONENTS</h1>
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

export default SystemsComponents;
