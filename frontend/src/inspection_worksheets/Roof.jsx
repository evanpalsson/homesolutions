import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import { debounce } from "../utils/debounce";
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
    updateRoofSystemDetails,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "roof");

  const [roofDetails, setRoofDetails] = useState(formData.roofSystemDetails || {});

  const debouncedUpdateRoofSystemDetails = useMemo(() => debounce(updateRoofSystemDetails, 300), [updateRoofSystemDetails]);

  useEffect(() => {
    if (formData.roofSystemDetails) {
      setRoofDetails(formData.roofSystemDetails);
    }
  }, [formData.roofSystemDetails]);

  const handleRoofDetailChange = (field, value) => {
    const updatedDetails = { ...roofDetails, [field]: value };
    setRoofDetails(updatedDetails);
    debouncedUpdateRoofSystemDetails(updatedDetails);
  };

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

      {/* ====== New Roof System Details Section ====== */}
      <div className="roof-system-details">
        <h2>Roof System Details</h2>

        <div className="roof-system-grid">

          {/* Row: Roof Age + Roof Layers */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Roof Age (Years):</label>
              <input type="number" value={roofDetails.age || ""} onChange={(e) => handleRoofDetailChange("age", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Number of Roof Layers:</label>
              <input type="number" value={roofDetails.layers || ""} onChange={(e) => handleRoofDetailChange("layers", e.target.value)} />
            </div>
          </div>

          {/* Row: Previous Repairs? + How many years ago */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Previous Repairs?</label>
              <select value={roofDetails.previousRepairs || "No"} onChange={(e) => handleRoofDetailChange("previousRepairs", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {roofDetails.previousRepairs === "Yes" && (
              <div className="form-group">
                <label>How many years ago?</label>
                <input type="number" value={roofDetails.repairsYearsAgo || ""} onChange={(e) => handleRoofDetailChange("repairsYearsAgo", e.target.value)} />
              </div>
            )}
          </div>

          {/* Row: Leak History? + Leak History Type */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>History of Leaks?</label>
              <select value={roofDetails.leakHistory || "No"} onChange={(e) => handleRoofDetailChange("leakHistory", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {roofDetails.leakHistory === "Yes" && (
              <div className="form-group">
                <label>Leak History Type:</label>
                <select value={roofDetails.leakHistoryType || ""} onChange={(e) => handleRoofDetailChange("leakHistoryType", e.target.value)}>
                  <option value="">Select</option>
                  <option>Interior Staining</option>
                  <option>Active Water Entry</option>
                  <option>Flashing Issues</option>
                  <option>Gutter Overflow</option>
                </select>
              </div>
            )}
          </div>

          {/* Row: Storm Damage? + Storm Damage Type */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Storm Damage History?</label>
              <select value={roofDetails.stormDamage || "No"} onChange={(e) => handleRoofDetailChange("stormDamage", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {roofDetails.stormDamage === "Yes" && (
              <div className="form-group">
                <label>Storm Damage Type:</label>
                <select value={roofDetails.stormDamageType || ""} onChange={(e) => handleRoofDetailChange("stormDamageType", e.target.value)}>
                  <option value="">Select</option>
                  <option>Hail Impact</option>
                  <option>Wind Lifted Shingles</option>
                  <option>Tree Impact</option>
                  <option>Flooding/Standing Water</option>
                </select>
              </div>
            )}
          </div>

          {/* Row: Warranty Active? + Warranty Expiration & Type */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Roof Warranty Active?</label>
              <select value={roofDetails.warrantyActive || "No"} onChange={(e) => handleRoofDetailChange("warrantyActive", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {roofDetails.warrantyActive === "Yes" && (
              <>
                <div className="form-group">
                  <label>Warranty Expiration Date:</label>
                  <input type="date" value={roofDetails.warrantyExpiration || ""} onChange={(e) => handleRoofDetailChange("warrantyExpiration", e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Warranty Type:</label>
                  <select value={roofDetails.warrantyType || ""} onChange={(e) => handleRoofDetailChange("warrantyType", e.target.value)}>
                    <option value="">Select</option>
                    <option>Manufacturer Material Warranty</option>
                    <option>Contractor Workmanship Warranty</option>
                    <option>Full System Warranty</option>
                  </select>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ====== Original Inspection Sections Below ====== */}
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
