import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import SystemPhotoUpload from "../components/SystemPhotoUpload";
import { debounce } from "../utils/debounce";
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

  const [coolingDetails, setCoolingDetails] = useState(formData.coolingSystemDetails || {});

  const debouncedUpdateCoolingSystemDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Cooling System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-cooling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Cooling System Details:", error);
    }
  }, 300), [inspectionId]);

  useEffect(() => {
    if (formData.coolingSystemDetails) {
      setCoolingDetails(formData.coolingSystemDetails);
    }
  }, [formData.coolingSystemDetails]);

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Cooling System Details");
    }
  }, [inspectionId, fetchPhotos]);

  const handleCoolingDetailChange = (field, value) => {
    const updatedDetails = { ...coolingDetails, [field]: value };
    setCoolingDetails(updatedDetails);
    debouncedUpdateCoolingSystemDetails(updatedDetails);
  };

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

      {/* ====== Cooling System Details Section ====== */}
      <div className="roof-system-details">
        <h2>Cooling System Details</h2>

        <div className="roof-system-grid">

          {/* Row: Cooling Age + Number of Units */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Cooling Equipment Age (Years):</label>
              <input type="number" value={coolingDetails.age || ""} onChange={(e) => handleCoolingDetailChange("age", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Refrigerant Type:</label>
              <select value={coolingDetails.refrigerantType || ""} onChange={(e) => handleCoolingDetailChange("refrigerantType", e.target.value)}>
                <option value="">Select</option>
                <option>R-22 (Freon)</option>
                <option>R-410A (Puron)</option>
                <option>R-32</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Units:</label>
              <input type="number" value={coolingDetails.units || ""} onChange={(e) => handleCoolingDetailChange("units", e.target.value)} />
            </div>
          </div>

          {/* Cooling Capacity (Tons) + BTU Rating */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Cooling Capacity (Tons):</label>
              <select value={coolingDetails.capacityTons || ""} onChange={(e) => handleCoolingDetailChange("capacityTons", e.target.value)}>
                <option value="">Select</option>
                <option value="1.5">1.5 tons (18,000 BTU)</option>
                <option value="2.0">2.0 tons (24,000 BTU)</option>
                <option value="2.5">2.5 tons (30,000 BTU)</option>
                <option value="3.0">3.0 tons (36,000 BTU)</option>
                <option value="3.5">3.5 tons (42,000 BTU)</option>
                <option value="4.0">4.0 tons (48,000 BTU)</option>
                <option value="5.0">5.0 tons (60,000 BTU)</option>
              </select>
            </div>

            <div className="form-group">
              <label>BTU Rating:</label>
              <input
                type="number"
                step="500"
                placeholder="Optional"
                value={coolingDetails.btuRating || ""}
                onChange={(e) => handleCoolingDetailChange("btuRating", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Last Service Date:</label>
              <input
                type="date"
                value={coolingDetails.lastServiceDate || ""}
                onChange={(e) => handleCoolingDetailChange("lastServiceDate", e.target.value)}
              />
            </div>
          </div>

          {/* Previous Repairs? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Previous Repairs?</label>
              <select value={coolingDetails.previousRepairs || "No"} onChange={(e) => handleCoolingDetailChange("previousRepairs", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {coolingDetails.previousRepairs === "Yes" && (
              <div className="form-group">
                <label>How many years ago?</label>
                <input type="number" value={coolingDetails.repairsYearsAgo || ""} onChange={(e) => handleCoolingDetailChange("repairsYearsAgo", e.target.value)} />
              </div>
            )}
          </div>

          {/* History of Failures? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>History of Failures?</label>
              <select value={coolingDetails.failureHistory || "No"} onChange={(e) => handleCoolingDetailChange("failureHistory", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {coolingDetails.failureHistory === "Yes" && (
              <div className="form-group">
                <label>Failure Type:</label>
                <select value={coolingDetails.failureType || ""} onChange={(e) => handleCoolingDetailChange("failureType", e.target.value)}>
                  <option value="">Select</option>
                  <option>Compressor Failure</option>
                  <option>Coil Leak</option>
                  <option>Refrigerant Line Leak</option>
                  <option>Electrical Control Failure</option>
                  <option>Other (see comments)</option>
                </select>
              </div>
            )}
          </div>

          {/* Warranty Active? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Warranty Active?</label>
              <select value={coolingDetails.warrantyActive || "No"} onChange={(e) => handleCoolingDetailChange("warrantyActive", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {coolingDetails.warrantyActive === "Yes" && (
              <>
                <div className="form-group">
                  <label>Warranty Expiration Date:</label>
                  <input type="date" value={coolingDetails.warrantyExpiration || ""} onChange={(e) => handleCoolingDetailChange("warrantyExpiration", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Warranty Type:</label>
                  <select value={coolingDetails.warrantyType || ""} onChange={(e) => handleCoolingDetailChange("warrantyType", e.target.value)}>
                    <option value="">Select</option>
                    <option>Manufacturer Parts Warranty</option>
                    <option>Contractor Workmanship Warranty</option>
                    <option>Extended Full System Warranty</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Cooling Label Upload */}
          <SystemPhotoUpload
            label="Cooling System Nameplate Photo"
            itemName="Cooling System Details"
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            handlePhotoRemove={handlePhotoRemove}
          />

        </div>
      </div>

      {/* ====== Original Cooling Sections Below ====== */}
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