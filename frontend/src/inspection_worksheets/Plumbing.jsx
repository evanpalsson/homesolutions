import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import SystemPhotoUpload from "../components/SystemPhotoUpload";
import { debounce } from "../utils/debounce";
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

  const [waterHeatingDetails, setWaterHeatingDetails] = useState(formData.waterHeatingSystemDetails || {});
  const [waterFiltrationExists, setWaterFiltrationExists] = useState(formData.waterFiltrationSystemDetails?.exists || "No");
  const [waterFiltrationDetails, setWaterFiltrationDetails] = useState(formData.waterFiltrationSystemDetails || {});

  const debouncedUpdateWaterHeatingDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Water Heating System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-plumbing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Water Heating System Details:", error);
    }
  }, 300), [inspectionId]);

  const debouncedUpdateWaterFiltrationDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Water Filtration System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-plumbing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Water Filtration System Details:", error);
    }
  }, 300), [inspectionId]);

  useEffect(() => {
    if (formData.waterHeatingSystemDetails) {
      setWaterHeatingDetails(formData.waterHeatingSystemDetails);
    }
    if (formData.waterFiltrationSystemDetails) {
      setWaterFiltrationDetails(formData.waterFiltrationSystemDetails);
      setWaterFiltrationExists(formData.waterFiltrationSystemDetails.exists || "No");
    }    
  }, [formData]);

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Water Heating System Details");
      fetchPhotos("Water Filtration System Details");
    }
  }, [inspectionId, fetchPhotos]);

  const handleWaterHeatingDetailChange = (field, value) => {
    const updatedDetails = { ...waterHeatingDetails, [field]: value };
    setWaterHeatingDetails(updatedDetails);
    debouncedUpdateWaterHeatingDetails(updatedDetails);
  };

  const handleWaterFiltrationDetailChange = (field, value) => {
    const updatedDetails = { ...waterFiltrationDetails, [field]: value };
    setWaterFiltrationDetails(updatedDetails);
    debouncedUpdateWaterFiltrationDetails(updatedDetails);
  };

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

      {/* ====== Water Heating System Details Section ====== */}
      <div className="roof-system-details">
        <h2>Water Heating System Details</h2>

        <div className="roof-system-grid">

          {/* Water Heater Type + Energy Source */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Water Heater Type:</label>
              <select value={waterHeatingDetails.type || ""} onChange={(e) => handleWaterHeatingDetailChange("type", e.target.value)}>
                <option value="">Select</option>
                <option>Tank</option>
                <option>Tankless</option>
                <option>Hybrid</option>
                <option>Solar</option>
              </select>
            </div>
            <div className="form-group">
              <label>Energy Source:</label>
              <select value={waterHeatingDetails.energySource || ""} onChange={(e) => handleWaterHeatingDetailChange("energySource", e.target.value)}>
                <option value="">Select</option>
                <option>Gas</option>
                <option>Electric</option>
                <option>Propane</option>
                <option>Solar</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Units:</label>
              <input
                type="number"
                value={waterHeatingDetails.numberOfUnits || ""}
                onChange={(e) => handleWaterHeatingDetailChange("numberOfUnits", e.target.value)}
              />
            </div>
          </div>

          {/* Capacity (Gallons) + Equipment Age */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Capacity (Gallons):</label>
              <input type="number" value={waterHeatingDetails.capacity || ""} onChange={(e) => handleWaterHeatingDetailChange("capacity", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Equipment Age (Years):</label>
              <input type="number" value={waterHeatingDetails.age || ""} onChange={(e) => handleWaterHeatingDetailChange("age", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Visible Corrosion/Rust?</label>
              <select value={waterHeatingDetails.visibleCorrosion || "No"} onChange={(e) => handleWaterHeatingDetailChange("visibleCorrosion", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {/* Visible Corrosion + Expansion Tank Present */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Expansion Tank Present?</label>
              <select value={waterHeatingDetails.expansionTank || "No"} onChange={(e) => handleWaterHeatingDetailChange("expansionTank", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Last Service Date:</label>
              <input
                type="date"
                value={waterHeatingDetails.lastServiceDate || ""}
                onChange={(e) => handleWaterHeatingDetailChange("lastServiceDate", e.target.value)}
              />
            </div>
          </div>

          {/* System Photo Upload */}
          <SystemPhotoUpload
            label="Water Heater Nameplate Photo"
            itemName="Water Heating System Details"
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            handlePhotoRemove={handlePhotoRemove}
          />

        </div>
      </div>

      {/* ====== Water Filtration System Details Section (Conditional) ====== */}
      <div className="roof-system-details">
        <h2>Water Filtration System Details</h2>

        {/* Does a Water Filtration System exist? */}
        <div className="roof-system-grid">
          <div className="roof-system-row">
            <div className="form-group">
              <label>Water Filtration System Present?</label>
              <select value={waterFiltrationExists} onChange={(e) => {
                setWaterFiltrationExists(e.target.value);
                handleWaterFiltrationDetailChange("exists", e.target.value);
              }}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>

          {waterFiltrationExists === "Yes" && (
            <>
              {/* Filtration System Type + Age */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Filtration System Type:</label>
                  <select value={waterFiltrationDetails.type || ""} onChange={(e) => handleWaterFiltrationDetailChange("type", e.target.value)}>
                    <option value="">Select</option>
                    <option>Whole House</option>
                    <option>Under Sink</option>
                    <option>Reverse Osmosis</option>
                    <option>Water Softener</option>
                    <option>UV Purification</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Equipment Age (Years):</label>
                  <input type="number" value={waterFiltrationDetails.age || ""} onChange={(e) => handleWaterFiltrationDetailChange("age", e.target.value)} />
                </div>
              </div>

              {/* Manufacturer + Filter Replacement Due */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Manufacturer:</label>
                  <input type="text" value={waterFiltrationDetails.manufacturer || ""} onChange={(e) => handleWaterFiltrationDetailChange("manufacturer", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Filter Replacement Due?</label>
                  <select value={waterFiltrationDetails.filterDue || "No"} onChange={(e) => handleWaterFiltrationDetailChange("filterDue", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              {/* Filtration System Photo Upload */}
              <SystemPhotoUpload
                label="Water Filtration Nameplate Photo"
                itemName="Water Filtration System Details"
                photos={photos}
                handlePhotoUpload={handlePhotoUpload}
                handlePhotoRemove={handlePhotoRemove}
              />
            </>
          )}

        </div>
      </div>

      {/* ====== Existing Standard Plumbing Items ====== */}
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
