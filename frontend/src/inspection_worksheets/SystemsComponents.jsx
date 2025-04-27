import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
import SystemPhotoUpload from "../components/SystemPhotoUpload";
import { debounce } from "../utils/debounce";
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

  const [poolExists, setPoolExists] = useState(formData.swimmingPoolSpaSystemDetails?.exists || "No");
  const [poolDetails, setPoolDetails] = useState(formData.swimmingPoolSpaSystemDetails || {});
  const [solarExists, setSolarExists] = useState(formData.solarEnergySystemDetails?.exists || "No");
  const [solarDetails, setSolarDetails] = useState(formData.solarEnergySystemDetails || {});

  const debouncedUpdatePoolDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Swimming Pool Spa System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-systemsComponents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Swimming Pool Spa System Details:", error);
    }
  }, 300), [inspectionId]);

  const debouncedUpdateSolarDetails = useMemo(() => debounce(async (details) => {
    if (!inspectionId) return;
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Solar Energy System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(details),
    }];
    try {
      await fetch("http://localhost:8080/api/inspection-systemsComponents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating Solar Energy System Details:", error);
    }
  }, 300), [inspectionId]);

  useEffect(() => {
    if (formData.swimmingPoolSpaSystemDetails) {
      setPoolDetails(formData.swimmingPoolSpaSystemDetails);
      setPoolExists(formData.swimmingPoolSpaSystemDetails.exists || "No");
    }
    if (formData.solarEnergySystemDetails) {
      setSolarDetails(formData.solarEnergySystemDetails);
      setSolarExists(formData.solarEnergySystemDetails.exists || "No");
    }
  }, [formData]);

  useEffect(() => {
    if (inspectionId) {
      fetchPhotos("Swimming Pool Spa System Details");
      fetchPhotos("Solar Energy System Details");
    }
  }, [inspectionId, fetchPhotos]);

  const handlePoolDetailChange = (field, value) => {
    const updatedDetails = { ...poolDetails, [field]: value };
    setPoolDetails(updatedDetails);
    debouncedUpdatePoolDetails(updatedDetails);
  };

  const handleSolarDetailChange = (field, value) => {
    const updatedDetails = { ...solarDetails, [field]: value };
    setSolarDetails(updatedDetails);
    debouncedUpdateSolarDetails(updatedDetails);
  };

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

      {/* Swimming Pool/Spa System Details Section */}
      <div className="roof-system-details">
        <h2>Swimming Pool / Spa System Details</h2>
        <div className="roof-system-grid">
          <div className="roof-system-row">
            <div className="form-group">
              <label>Swimming Pool or Spa Present?</label>
              <select value={poolExists} onChange={(e) => {
                setPoolExists(e.target.value);
                handlePoolDetailChange("exists", e.target.value);
              }}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>

          {poolExists === "Yes" && (
            <>
              <div className="roof-system-row">
                <div className="form-group">
                  <label>Pool/Spa Type:</label>
                  <select value={poolDetails.poolType || ""} onChange={(e) => handlePoolDetailChange("poolType", e.target.value)}>
                    <option value="">Select</option>
                    <option>In-Ground</option>
                    <option>Above-Ground</option>
                    <option>Spa</option>
                    <option>Combination</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Surface Material:</label>
                  <select value={poolDetails.surfaceMaterial || ""} onChange={(e) => handlePoolDetailChange("surfaceMaterial", e.target.value)}>
                    <option value="">Select</option>
                    <option>Concrete</option>
                    <option>Vinyl</option>
                    <option>Fiberglass</option>
                    <option>Plaster</option>
                  </select>
                </div>
              </div>

              <div className="roof-system-row">
                <div className="form-group">
                  <label>Age (Years):</label>
                  <input type="number" value={poolDetails.age || ""} onChange={(e) => handlePoolDetailChange("age", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last Inspection Date:</label>
                  <input type="date" value={poolDetails.lastInspectionDate || ""} onChange={(e) => handlePoolDetailChange("lastInspectionDate", e.target.value)} />
                </div>
              </div>

              <SystemPhotoUpload
                label="Swimming Pool/Spa System Photo"
                itemName="Swimming Pool Spa System Details"
                photos={photos}
                handlePhotoUpload={handlePhotoUpload}
                handlePhotoRemove={handlePhotoRemove}
              />
            </>
          )}
        </div>
      </div>

      {/* Solar Energy System Details Section */}
      <div className="roof-system-details">
        <h2>Solar Energy System Details</h2>
        <div className="roof-system-grid">
          <div className="roof-system-row">
            <div className="form-group">
              <label>Solar Energy System Present?</label>
              <select value={solarExists} onChange={(e) => {
                setSolarExists(e.target.value);
                handleSolarDetailChange("exists", e.target.value);
              }}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>

          {solarExists === "Yes" && (
          <>
            <div className="roof-system-row">
              <div className="form-group">
                <label>Panel Manufacturer:</label>
                <input
                  type="text"
                  value={solarDetails.panelManufacturer || ""}
                  onChange={(e) => handleSolarDetailChange("panelManufacturer", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Installation Year:</label>
                <input
                  type="number"
                  value={solarDetails.installYear || ""}
                  onChange={(e) => handleSolarDetailChange("installYear", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Inverter Type:</label>
                <select
                  value={solarDetails.inverterType || ""}
                  onChange={(e) => handleSolarDetailChange("inverterType", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>String Inverter</option>
                  <option>Microinverter</option>
                  <option>Hybrid Inverter</option>
                </select>
              </div>
            </div>

            <div className="roof-system-row">
              <div className="form-group">
                <label>Warranty Status:</label>
                <select
                  value={solarDetails.warrantyStatus || ""}
                  onChange={(e) => handleSolarDetailChange("warrantyStatus", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Active</option>
                  <option>Expired</option>
                </select>
              </div>

              {solarDetails.warrantyStatus === "Active" && (
                <>
                  <div className="form-group">
                    <label>Warranty Expiration Date:</label>
                    <input
                      type="date"
                      value={solarDetails.warrantyExpiration || ""}
                      onChange={(e) => handleSolarDetailChange("warrantyExpiration", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Warranty Type:</label>
                    <select
                      value={solarDetails.warrantyType || ""}
                      onChange={(e) => handleSolarDetailChange("warrantyType", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Manufacturer Material Warranty</option>
                      <option>Installer Workmanship Warranty</option>
                      <option>Full System Warranty</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <SystemPhotoUpload
              label="Solar Energy System Photo"
              itemName="Solar Energy System Details"
              photos={photos}
              handlePhotoUpload={handlePhotoUpload}
              handlePhotoRemove={handlePhotoRemove}
            />
          </>
        )}
        </div>
      </div>

      {/* Existing Components */}
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
