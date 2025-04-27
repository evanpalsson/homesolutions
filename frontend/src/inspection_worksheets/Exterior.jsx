import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import SystemPhotoUpload from "../components/SystemPhotoUpload";
import { debounce } from "../utils/debounce";
import "../styles/InspectionWorksheets.css";

const Exterior = () => {
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
  } = InspectionCRUD(inspectionId, "exterior");

  const [waterIntrusionExists, setWaterIntrusionExists] = useState(formData.waterIntrusionManagementDetails?.exists || "No");
  const [waterIntrusionDetails, setWaterIntrusionDetails] = useState(formData.waterIntrusionManagementDetails || {});
  const [irrigationExists, setIrrigationExists] = useState(() => {
    if (formData.irrigationSystemDetails && Object.keys(formData.irrigationSystemDetails).length > 0) {
      return formData.irrigationSystemDetails.exists || "Yes";
    }
    return "No";
  });
  
  const [irrigationDetails, setIrrigationDetails] = useState(formData.irrigationSystemDetails || {});

  const debouncedUpdateWaterIntrusionDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Water Intrusion Management Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-exterior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Water Intrusion Management Details:", error);
    }
  }, 300), [inspectionId]);

  const debouncedUpdateIrrigationDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Irrigation System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-exterior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Irrigation System Details:", error);
    }
  }, 300), [inspectionId]);

  useEffect(() => {
    if (formData.waterIntrusionManagementDetails) {
      setWaterIntrusionDetails(formData.waterIntrusionManagementDetails);
      setWaterIntrusionExists(formData.waterIntrusionManagementDetails.exists || "No");
    }
    if (formData.irrigationSystemDetails) {
      setIrrigationDetails(formData.irrigationSystemDetails);
      setIrrigationExists(formData.irrigationSystemDetails.exists || "Yes");
    }
  }, [formData]);  

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Water Intrusion Management Details");
      fetchPhotos("Irrigation System Details");
    }
  }, [inspectionId, fetchPhotos]);

  const handleWaterIntrusionDetailChange = (field, value) => {
    const updatedDetails = { ...waterIntrusionDetails, [field]: value };
    setWaterIntrusionDetails(updatedDetails);
    debouncedUpdateWaterIntrusionDetails(updatedDetails);
  };

  const handleIrrigationDetailChange = (field, value) => {
    const updatedDetails = { ...irrigationDetails, [field]: value };
    setIrrigationDetails(updatedDetails);
    debouncedUpdateIrrigationDetails(updatedDetails);
  };

  const items = useMemo(() => [
    {
      name: "Siding, Flashing, and Trim",
      label: "Exterior Wall Covering Type",
      componentTypes: ["Wood", "Vinyl", "Aluminum", "Fiber Cement", "Brick Veneer", "Stone Veneer", "Stucco", "Other (see comments)"],
      condition: ["Cracked", "Peeling", "Rot", "Loose", "Damaged", "Normal Wear"],
    },
    {
      name: "Eaves, Soffits, and Fascia",
      label: "Soffit/Fascia Material",
      componentTypes: ["Wood", "Aluminum", "Vinyl", "Fiber Cement", "Other (see comments)"],
      condition: ["Peeling", "Rot", "Missing", "Damaged", "Normal"],
    },
    {
      name: "Porches, Balconies, Decks, and Steps",
      label: "Porch/Deck Material",
      componentTypes: ["Wood", "Composite", "Concrete", "Stone", "Other (see comments)"],
      condition: ["Rot", "Loose Railings", "Settling", "Cracked", "Normal"],
    },
    {
      name: "Driveways, Walkways, and Patios",
      label: "Pavement/Surface Type",
      componentTypes: ["Concrete", "Asphalt", "Pavers", "Stone", "Gravel", "Other (see comments)"],
      condition: ["Cracked", "Settled", "Heaved", "Surface Wear", "Normal"],
    },
    {
      name: "Vegetation, Grading, Drainage",
      label: "Site Feature Type",
      componentTypes: ["Overhanging Trees", "Negative Grading", "Drainage Swales", "Retaining Walls", "Other (see comments)"],
      condition: ["Proper", "Improper", "Blocked", "Damaged", "Normal"],
    },
  ], []);

  return (
    <div>
      <h1 className="component-title">6. EXTERIOR</h1>

      {/* ===== Water Intrusion Management Details (only if exists) ===== */}
      <div className="roof-system-details">
        <h2>Water Intrusion Management Details</h2>

        {/* Water Intrusion System Exists? */}
        <div className="roof-system-grid">
          <div className="roof-system-row">
            <div className="form-group">
              <label>Water Intrusion Management Features Present?</label>
              <select value={waterIntrusionExists} onChange={(e) => {
                setWaterIntrusionExists(e.target.value);
                handleWaterIntrusionDetailChange("exists", e.target.value);
              }}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {waterIntrusionExists === "Yes" && (
            <>
              {/* Gutter System Present + Gutter Condition */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Gutter System Present?</label>
                  <select value={waterIntrusionDetails.guttersPresent || "No"} onChange={(e) => handleWaterIntrusionDetailChange("guttersPresent", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gutter Condition:</label>
                  <select value={waterIntrusionDetails.gutterCondition || ""} onChange={(e) => handleWaterIntrusionDetailChange("gutterCondition", e.target.value)}>
                    <option value="">Select</option>
                    <option>Proper Drainage</option>
                    <option>Clogged</option>
                    <option>Leaking</option>
                    <option>Detached</option>
                    <option>Normal</option>
                  </select>
                </div>
              </div>

              {/* Site Grading Proper + Sump Pump Present */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Site Grading Proper?</label>
                  <select value={waterIntrusionDetails.siteGrading || ""} onChange={(e) => handleWaterIntrusionDetailChange("siteGrading", e.target.value)}>
                    <option value="">Select</option>
                    <option>Proper</option>
                    <option>Improper</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sump Pump Present?</label>
                  <select value={waterIntrusionDetails.sumpPumpPresent || "No"} onChange={(e) => handleWaterIntrusionDetailChange("sumpPumpPresent", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              {/* System Photo Upload */}
              <SystemPhotoUpload
                label="Water Intrusion Management Photo"
                itemName="Water Intrusion Management Details"
                photos={photos}
                handlePhotoUpload={handlePhotoUpload}
                handlePhotoRemove={handlePhotoRemove}
              />
            </>
          )}
        </div>
      </div>

      {/* ===== Irrigation System Details (only if exists) ===== */}
      <div className="roof-system-details">
        <h2>Irrigation System Details</h2>
        <div className="roof-system-grid">

          {/* Irrigation System Exists? */}
          <div className="roof-system-row">
            <div className="form-group">
              <label>Irrigation System Present?</label>
              <select value={irrigationExists} onChange={(e) => {
                setIrrigationExists(e.target.value);
                handleIrrigationDetailChange("exists", e.target.value);
              }}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {irrigationExists === "Yes" && (
            <>
              {/* Controller Brand + Number of Zones */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Controller Brand/Model:</label>
                  <input type="text" value={irrigationDetails.controller || ""} onChange={(e) => handleIrrigationDetailChange("controller", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Number of Zones:</label>
                  <input type="number" value={irrigationDetails.zones || ""} onChange={(e) => handleIrrigationDetailChange("zones", e.target.value)} />
                </div>
              </div>

              {/* Leaks Visible + Backflow Device Present */}
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Leaks Visible?</label>
                  <select value={irrigationDetails.leaks || "No"} onChange={(e) => handleIrrigationDetailChange("leaks", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Backflow Device Present?</label>
                  <select value={irrigationDetails.backflow || "No"} onChange={(e) => handleIrrigationDetailChange("backflow", e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              {/* System Photo Upload */}
              <SystemPhotoUpload
                label="Irrigation System Controller Photo"
                itemName="Irrigation System Details"
                photos={photos}
                handlePhotoUpload={handlePhotoUpload}
                handlePhotoRemove={handlePhotoRemove}
              />
            </>
          )}

        </div>
      </div>

      {/* ===== Existing Exterior Items ===== */}
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

export default Exterior;