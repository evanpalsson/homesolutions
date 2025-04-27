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
      if (item.item_name === "Roof System Details") {
        // Special handling for Roof System Details
        try {
          acc.roofSystemDetails = JSON.parse(item.comments || "{}");
        } catch (e) {
          console.error("Error parsing Roof System Details comments JSON:", e);
          acc.roofSystemDetails = {};
        }
      } else {
        // Normal item loading
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
    handleCommentChange,
    handleStatusChange,
    handleResize,
    handlePhotoUpload,
    handlePhotoRemove,
    fetchPhotos,
    photos,
  };
}
