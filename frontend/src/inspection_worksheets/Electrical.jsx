import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import SystemPhotoUpload from "../components/SystemPhotoUpload";
import { debounce } from "../utils/debounce";
import "../styles/InspectionWorksheets.css";

const Electrical = () => {
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
  } = InspectionCRUD(inspectionId, "electrical");

  const [electricalDetails, setElectricalDetails] = useState(formData.electricalSystemDetails || {});

  const debouncedUpdateElectricalSystemDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Electrical System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-electrical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Electrical System Details:", error);
    }
  }, 300), [inspectionId]);

  useEffect(() => {
    if (formData.electricalSystemDetails) {
      setElectricalDetails(formData.electricalSystemDetails);
    }
  }, [formData.electricalSystemDetails]);

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Electrical System Details");
    }
  }, [inspectionId, fetchPhotos]);

  const handleElectricalDetailChange = (field, value) => {
    const updatedDetails = { ...electricalDetails, [field]: value };
    setElectricalDetails(updatedDetails);
    debouncedUpdateElectricalSystemDetails(updatedDetails);
  };

  const items = useMemo(() => [
    {
      name: "Service Entrance",
      label: "Service Entrance Type",
      componentTypes: ["Overhead", "Underground", "Other (see comments)"],
      condition: ["Secure", "Loose", "Damaged", "Corroded", "Normal"],
    },
    {
      name: "Main Panel",
      label: "Main Panel Type",
      componentTypes: ["Breaker Panel", "Fuse Panel", "Subpanel", "Combination Panel", "Other (see comments)"],
      condition: ["Operational", "Corrosion", "Missing Covers", "Improper Wiring", "Normal"],
    },
    {
      name: "Branch Wiring",
      label: "Branch Wiring Type",
      componentTypes: ["Copper", "Aluminum", "Knob and Tube", "BX Cable", "Romex", "Other (see comments)"],
      condition: ["Properly Installed", "Double Tapped", "Damaged", "Loose", "Normal"],
    },
    {
      name: "Outlets and Fixtures",
      label: "Outlet/Fixture Type",
      componentTypes: ["Standard Outlets", "GFCI Outlets", "AFCI Protection", "Lighting Fixtures", "Other (see comments)"],
      condition: ["Operational", "Non-Operational", "Reversed Polarity", "Ungrounded", "Normal"],
    },
    {
      name: "Grounding & Bonding",
      label: "Grounding System Type",
      componentTypes: ["Rod Ground", "Water Pipe Ground", "Other (see comments)"],
      condition: ["Proper", "Improper", "Missing", "Loose", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">8. ELECTRICAL SYSTEMS</h1>

      {/* ====== Electrical System Details Section ====== */}
      <div className="roof-system-details">
        <h2>Electrical System Details</h2>

        <div className="roof-system-grid">

          {/* Panel Brand + Panel Age */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Main Service Panel Age (Years):</label>
              <input
                type="number"
                value={electricalDetails.panelAge || ""}
                onChange={(e) => handleElectricalDetailChange("panelAge", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Service Amperage:</label>
              <select value={electricalDetails.amperage || ""} onChange={(e) => handleElectricalDetailChange("amperage", e.target.value)}>
                <option value="">Select</option>
                <option>60A</option>
                <option>100A</option>
                <option>150A</option>
                <option>200A</option>
                <option>400A</option>
              </select>
            </div>
            <div className="form-group">
              <label>Service Voltage:</label>
              <select value={electricalDetails.voltage || ""} onChange={(e) => handleElectricalDetailChange("voltage", e.target.value)}>
                <option value="">Select</option>
                <option>120V</option>
                <option>120/240V</option>
              </select>
            </div>
          </div>

          {/* Number of Panels + Aluminum Wiring */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Number of Panels:</label>
              <input
                type="number"
                value={electricalDetails.numberOfPanels || ""}
                onChange={(e) => handleElectricalDetailChange("numberOfPanels", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Aluminum Branch Wiring?</label>
              <select value={electricalDetails.aluminumWiring || "No"} onChange={(e) => handleElectricalDetailChange("aluminumWiring", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Last Service Date:</label>
              <input
                type="date"
                value={electricalDetails.lastServiceDate || ""}
                onChange={(e) => handleElectricalDetailChange("lastServiceDate", e.target.value)}
              />
            </div>
          </div>

          {/* System Photo Upload */}
          <SystemPhotoUpload
            label="Main Service Panel Nameplate Photo"
            itemName="Electrical System Details"
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            handlePhotoRemove={handlePhotoRemove}
          />

        </div>
      </div>

      {/* ====== Existing Electrical Sections ====== */}
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

export default Electrical;
