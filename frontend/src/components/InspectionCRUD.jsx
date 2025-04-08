// InspectionCRUD.jsx
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
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
      acc[item.item_name] = {
        materials: item.materials,
        conditions: item.conditions || {},
        comment: item.comments || "",
        inspection_status: item.inspection_status || "Not Inspected",
      };
      return acc;
    }, {});
    setFormData(data);
  }, [inspectionId, section]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const updateBackend = async (updatedData) => {
    const payload = Object.entries(updatedData).map(([itemName, details]) => ({
      inspection_id: inspectionId,
      item_name: itemName,
      materials: details.materials || {},
      conditions: details.conditions || {},
      comments: details.comment || "",
      inspection_status: details.inspection_status || "Not Inspected",
    }));
    await axios.post(`http://localhost:8080/api/inspection-${section}`, payload);
  };

  const debouncedUpdate = debounce(updateBackend, 500);

  const updateItem = (itemName, field, value) => {
    const current = formData[itemName] || {};
    const updated = {
      ...current,
      [field]: value,
    };

    const currentStatus = current.inspection_status || "Not Inspected";
    const isOverride = currentStatus === "Not Present" || currentStatus === "Repair or Replace";
    const hasSelected =
      Object.values(updated.materials || {}).some(Boolean) ||
      Object.values(updated.conditions || {}).some(Boolean);

    if (!isOverride && hasSelected) {
      updated.inspection_status = "Inspected";
    }

    const updatedData = {
      ...formData,
      [itemName]: updated,
    };

    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleCheckboxChange = (itemName, type, value) => {
    const existingItem = formData[itemName] || {};
    const updatedTypeData = {
      ...(existingItem[type] || {}),
      [value]: !existingItem?.[type]?.[value],
    };

    updateItem(itemName, type, updatedTypeData);
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
    handleCheckboxChange,
    handleCommentChange,
    handleStatusChange,
    handleResize,
    handlePhotoUpload,
    handlePhotoRemove,
    fetchPhotos,
    photos,
  };
}
