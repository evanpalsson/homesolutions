// InspectionCRUD.jsx
import { useState, useCallback, useEffect } from "react";
import axios from "../utils/axios";
import { debounce } from "../utils/debounce";
import React from "react";

export const InspectionStatusDropdown = ({ value, onChange }) => {
  return (
    <div className="item-list">
      <label><strong>Status:</strong></label>
      <select
        value={value || "Not Inspected"}
        onChange={(e) => onChange(e.target.value)}
        className="status-dropdown"
      >
        <option value="Inspected">Inspected</option>
        <option value="Not Inspected">Not Inspected</option>
        <option value="Not Present">Not Present</option>
        <option value="Repair or Replace">Repair or Replace</option>
      </select>
    </div>
  );
};

export function InspectionCRUD(inspectionId, section) {
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState({});

  const fetchPhotos = useCallback(async (itemName) => {
    const url = `http://localhost:8080/api/inspection-photo/${inspectionId}/${encodeURIComponent(itemName)}`;
    const response = await axios.get(url);
    setPhotos((prev) => ({ ...prev, [itemName]: response.data }));
  }, [inspectionId]);

  const fetchSectionData = useCallback(async () => {
    const url = `http://localhost:8080/api/inspection-${section}/${inspectionId}`;
    const response = await axios.get(url);
    const resData = response.data || [];
  
    const data = resData.reduce((acc, item) => {
      if (item.item_name.endsWith("System Details")) {
        // Dynamic System Details Parser (Roof, Heating, Cooling, Plumbing, Electrical, etc.)
        const key = item.item_name
          .replace(/\s+/g, "")  // Remove all spaces
          .replace("SystemDetails", "SystemDetails"); // Clean key name
        try {
          acc[key.charAt(0).toLowerCase() + key.slice(1)] = JSON.parse(item.comments || "{}");
        } catch (e) {
          console.error(`Error parsing ${item.item_name} JSON:`, e);
          acc[key.charAt(0).toLowerCase() + key.slice(1)] = {};
        }
      } else {
        // Normal Section Items (Roof Covering, Gutters, Fixtures, etc.)
        acc[item.item_name] = {
          componentTypeConditions: item.materials && typeof item.materials === 'object' ? item.materials : {},
          comment: item.comments || "",
          inspection_status: item.inspection_status || "Not Inspected",
        };
      }
      return acc;
    }, {});      
  
    setFormData(data);
  }, [inspectionId, section]);  

  const updateSingleBackend = async (itemName, itemDetails) => {
    const payload = [{
      inspection_id: inspectionId,
      item_name: itemName,
      materials: itemDetails.componentTypeConditions || {}, // ✅ properly mapped!
      conditions: {}, // ✅ empty object for now
      comments: itemDetails.comment || "",
      inspection_status: itemDetails.inspection_status || "Not Inspected",
    }];
  
    console.log("Posting payload to backend:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-${section}`, payload);
    } catch (error) {
      console.error(`Error updating item ${itemName}:`, error);
    }
  };  

  const debouncedUpdateSingle = debounce(updateSingleBackend, 300);

  const updateItem = (itemName, field, value) => {
    setFormData((prevData) => {
      const current = prevData[itemName] || {};
      const updatedItem = {
        ...current,
        [field]: value,
      };

      const currentStatus = current.inspection_status || "Not Inspected";
      const hasSelected = value && Object.keys(value).length > 0;
      const isOverride = currentStatus === "Not Present" || currentStatus === "Repair or Replace";

      if (!isOverride && currentStatus === "Not Inspected" && hasSelected) {
        updatedItem.inspection_status = "Inspected";
      }

      debouncedUpdateSingle(itemName, updatedItem); // 🔥 Save only this item
      return {
        ...prevData,
        [itemName]: updatedItem,
      };
    });
  };

  const updateComponentTypeConditions = (itemName, newMapping) => {
    setFormData((prevFormData) => {
      const updatedItem = {
        ...prevFormData[itemName],
        componentTypeConditions: newMapping,
      };
      debouncedUpdateSingle(itemName, updatedItem);
      return {
        ...prevFormData,
        [itemName]: updatedItem,
      };
    });
  };

  const updateRoofSystemDetails = async (roofDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Roof System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(roofDetails),
    }];
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-roof`, payload);
    } catch (error) {
      console.error("Error updating Roof System Details:", error);
    }
  };

  const updateHeatingSystemDetails = async (heatingDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Heating System Details", // 🔥 Special identifier
      inspection_status: "Inspected", // default status
      materials: {}, // empty because we're using comments
      conditions: {}, // empty because we're using comments
      comments: JSON.stringify(heatingDetails), // Save heating fields inside comments as JSON
    }];
  
    console.log("Posting Heating System Details payload:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-heating`, payload);
    } catch (error) {
      console.error("Error updating Heating System Details:", error);
    }
  };

  const updateCoolingSystemDetails = async (coolingDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Cooling System Details", // 🔥 Special identifier
      inspection_status: "Inspected", // default status
      materials: {}, // empty because we're using comments
      conditions: {}, // empty because we're using comments
      comments: JSON.stringify(coolingDetails), // Save cooling fields inside comments as JSON
    }];
  
    console.log("Posting Cooling System Details payload:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-cooling`, payload);
    } catch (error) {
      console.error("Error updating Cooling System Details:", error);
    }
  };

  const updateWaterHeatingSystemDetails = async (waterHeatingDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Water Heating System Details", // 🔥 Special identifier
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(waterHeatingDetails),
    }];
  
    console.log("Posting Water Heating System Details payload:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-plumbing`, payload);
    } catch (error) {
      console.error("Error updating Water Heating System Details:", error);
    }
  };

  const updateWaterFiltrationSystemDetails = async (waterFiltrationDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Water Filtration System Details", // 🔥 Special identifier
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(waterFiltrationDetails),
    }];
  
    console.log("Posting Water Filtration System Details payload:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-plumbing`, payload);
    } catch (error) {
      console.error("Error updating Water Filtration System Details:", error);
    }
  };

  const updateElectricalSystemDetails = async (electricalDetails) => {
    if (!inspectionId) return;
  
    const payload = [{
      inspection_id: inspectionId,
      item_name: "Electrical System Details",
      inspection_status: "Inspected",
      materials: {},
      conditions: {},
      comments: JSON.stringify(electricalDetails),
    }];
  
    console.log("Posting Electrical System Details payload:", payload);
  
    try {
      await axios.post(`http://localhost:8080/api/inspection-electrical`, payload);
    } catch (error) {
      console.error("Error updating Electrical System Details:", error);
    }
  };  

  const handleCommentChange = (itemName, comment) => {
    updateItem(itemName, "comment", comment);
  };

  const handleStatusChange = (itemName, status) => {
    updateItem(itemName, "inspection_status", status);
  };

  const handleResize = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  const handlePhotoUpload = async (itemName, e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("inspection_id", inspectionId);
      data.append("item_name", itemName);
      data.append("photo", files[i]);
      try {
        await axios.post("http://localhost:8080/api/inspection-photo", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fetchPhotos(itemName);
      } catch (error) {
        console.error(`Error uploading photo for ${itemName}:`, error);
      }
    }
    e.target.value = "";
  };

  const handlePhotoRemove = async (itemName, photoId) => {
    try {
      await axios.delete(`http://localhost:8080/api/inspection-photo/${photoId}`);
      fetchPhotos(itemName);
    } catch (error) {
      console.error(`Error removing photo for ${itemName}:`, error);
    }
  };

  useEffect(() => {
    if (inspectionId) fetchSectionData();
  }, [inspectionId, fetchSectionData]);

  return {
    formData,
    setFormData,
    updateItem,
    updateComponentTypeConditions,
    updateRoofSystemDetails,
    updateHeatingSystemDetails,
    updateCoolingSystemDetails,
    updateWaterHeatingSystemDetails,
    updateWaterFiltrationSystemDetails,
    updateElectricalSystemDetails,
    handleCommentChange,
    handleStatusChange,
    handleResize,
    handlePhotoUpload,
    handlePhotoRemove,
    fetchPhotos,
    photos,
  };
}
