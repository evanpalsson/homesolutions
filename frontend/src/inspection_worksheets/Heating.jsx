import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import { debounce } from "../utils/debounce";
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
    updateHeatingSystemDetails,
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "heating");

  const [heatingDetails, setHeatingDetails] = useState(formData.heatingSystemDetails || {});

  const debouncedUpdateHeatingSystemDetails = useMemo(() => debounce(updateHeatingSystemDetails, 300), [updateHeatingSystemDetails]);

  useEffect(() => {
    if (formData.heatingSystemDetails) {
      setHeatingDetails(formData.heatingSystemDetails);
    }
  }, [formData.heatingSystemDetails]);

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Heating System Details");
    }
  }, [inspectionId, fetchPhotos]);
  

  const handleHeatingDetailChange = (field, value) => {
    const updatedDetails = { ...heatingDetails, [field]: value };
    setHeatingDetails(updatedDetails);
    debouncedUpdateHeatingSystemDetails(updatedDetails);
  };

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
      <h1 className="component-title">7. HEATING SYSTEM</h1>

      {/* ====== New Heating System Details Section ====== */}
      <div className="roof-system-details">
        <h2>Heating System Details</h2>

        <div className="roof-system-grid">

          {/* Row: Heating Age + Number of Units */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Heating Equipment Age (Years):</label>
              <input type="number" value={heatingDetails.age || ""} onChange={(e) => handleHeatingDetailChange("age", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Number of Units:</label>
              <input type="number" value={heatingDetails.units || ""} onChange={(e) => handleHeatingDetailChange("units", e.target.value)} />
            </div>
          </div>

          {/* Fuel Type */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Fuel Type:</label>
              <select value={heatingDetails.fuelType || ""} onChange={(e) => handleHeatingDetailChange("fuelType", e.target.value)}>
                <option value="">Select</option>
                <option>Natural Gas</option>
                <option>Propane</option>
                <option>Electric</option>
                <option>Oil</option>
                <option>Solar</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Previous Repairs? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Previous Repairs?</label>
              <select value={heatingDetails.previousRepairs || "No"} onChange={(e) => handleHeatingDetailChange("previousRepairs", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {heatingDetails.previousRepairs === "Yes" && (
              <div className="form-group">
                <label>How many years ago?</label>
                <input type="number" value={heatingDetails.repairsYearsAgo || ""} onChange={(e) => handleHeatingDetailChange("repairsYearsAgo", e.target.value)} />
              </div>
            )}
          </div>

          {/* History of Failures? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>History of Failures?</label>
              <select value={heatingDetails.failureHistory || "No"} onChange={(e) => handleHeatingDetailChange("failureHistory", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {heatingDetails.failureHistory === "Yes" && (
              <div className="form-group">
                <label>Failure Type:</label>
                <select value={heatingDetails.failureType || ""} onChange={(e) => handleHeatingDetailChange("failureType", e.target.value)}>
                  <option value="">Select</option>
                  <option>Blower Motor Failure</option>
                  <option>Heat Exchanger Crack</option>
                  <option>Electrical Ignition Problem</option>
                  <option>Gas Valve Failure</option>
                  <option>Other (see comments)</option>
                </select>
              </div>
            )}
          </div>

          {/* Visible Corrosion/Rust? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Visible Corrosion/Rust?</label>
              <select value={heatingDetails.visibleCorrosion || "No"} onChange={(e) => handleHeatingDetailChange("visibleCorrosion", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {/* Warranty Active? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Warranty Active?</label>
              <select value={heatingDetails.warrantyActive || "No"} onChange={(e) => handleHeatingDetailChange("warrantyActive", e.target.value)}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            {heatingDetails.warrantyActive === "Yes" && (
              <>
                <div className="form-group">
                  <label>Warranty Expiration Date:</label>
                  <input type="date" value={heatingDetails.warrantyExpiration || ""} onChange={(e) => handleHeatingDetailChange("warrantyExpiration", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Warranty Type:</label>
                  <select value={heatingDetails.warrantyType || ""} onChange={(e) => handleHeatingDetailChange("warrantyType", e.target.value)}>
                    <option value="">Select</option>
                    <option>Manufacturer Parts Warranty</option>
                    <option>Contractor Workmanship Warranty</option>
                    <option>Extended Full System Warranty</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Heating System Label Upload */}
          <div className="photo-upload-container">
            <strong>Heating Source Label:</strong>
            <div className="custom-file-upload">
              <button
                type="button"
                onClick={() => document.getElementById("file-upload-heating-label").click()}
                className="upload-button"
              >
                Upload Photo
              </button>
              <input
                id="file-upload-heating-label"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handlePhotoUpload("Heating System Details", e)}
              />
            </div>

            <div className="photo-preview">
              {photos["Heating System Details"]?.length > 0 ? (
                photos["Heating System Details"].map((photo) => (
                  <div key={photo.photo_id} className="photo-item">
                    <img src={`http://localhost:8080${photo.photo_url}`} alt="Heating Label" />
                    <button
                      type="button"
                      onClick={() => handlePhotoRemove("Heating System Details", photo.photo_id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No heating label photo uploaded.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ====== Original Heating Sections Below ====== */}
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
