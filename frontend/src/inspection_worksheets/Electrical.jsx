import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import InspectionStatusDropdown from "../components/InspectionStatusDropdown";
import "../styles/InspectionWorksheets.css";

const Electrical = () => {
  const { inspectionId } = useParams(); 
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState({});

  const items = useMemo(() => [
    {
      name: "Service Panel",
      materials: ["Circuit Breakers", "Fuses", "Subpanel", "Main Panel", "Other (see comments)"],
      condition: ["Properly Labeled", "Overloaded", "Double Taps", "Loose Connections"],
    },
    {
      name: "Wiring",
      materials: ["Copper", "Aluminum", "Knob & Tube", "BX", "Romex", "Other (see comments)"],
      condition: ["Exposed", "Damaged Insulation", "Outdated", "Improper Splices"],
    },
    {
      name: "Outlets & Switches",
      materials: ["GFCI", "AFCI", "Ungrounded", "Three-prong", "Other (see comments)"],
      condition: ["Functional", "Hot to Touch", "Ungrounded", "Loose"],
    },
    {
      name: "Lighting",
      materials: ["Ceiling", "Wall-mounted", "Recessed", "Track", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Flickering", "Missing Bulbs"],
    },
    {
        name: "Smoke and CO Detectors",
      materials: ["Smoke", "CO", "Combo Unit", "Battery-powered", "Hardwired"],
      condition: ["Present", "Expired", "Missing", "Not Functional"],
    },
  ], []);

  const fetchPhotos = useCallback(async (itemName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inspection-photo/${inspectionId}/${encodeURIComponent(itemName)}`);
      setPhotos((prev) => ({ ...prev, [itemName]: response.data }));
    } catch (error) {
      console.error(`Error fetching photos for ${itemName}:`, error);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId) {
      items.forEach(item => fetchPhotos(item.name));
    }
  }, [inspectionId, items, fetchPhotos]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inspection-electrical/${inspectionId}`);
        const arrayData = Array.isArray(response.data) ? response.data : [];
        const data = arrayData.reduce((acc, item) => {
          acc[item.item_name] = {
            materials: item.materials,
            conditions: item.conditions || {},
            comment: item.comments || "",
            inspection_status: item.inspection_status || "Not Inspected",
          };
          return acc;
        }, {});
        setFormData(data);
      } catch (error) {
        console.error("Error fetching electrical data:", error);
      }
    };

    if (inspectionId) {
      fetchData();
    }
  }, [inspectionId]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const updateBackend = async (updatedData) => {
    try {
      const payload = Object.entries(updatedData).map(([itemName, details]) => ({
        inspection_id: inspectionId,
        item_name: itemName,
        materials: details.materials || {},
        conditions: details.conditions || {},
        comments: details.comment || "",
        inspection_status: details.inspection_status || "Not Inspected",
      }));

      await axios.post("http://localhost:8080/api/inspection-electrical", payload);
    } catch (error) {
      console.error("Error updating backend:", error);
    }
  };  

  const debouncedUpdate = debounce(updateBackend, 500);

  const handleCheckboxChange = (itemName, type, value) => {
    const updatedData = {
      ...formData,
      [itemName]: {
        ...formData[itemName],
        [type]: {
          ...formData[itemName]?.[type],
          [value]: !formData[itemName]?.[type]?.[value],
        },
      },
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleCommentChange = (itemName, comment) => {
    const updatedData = {
      ...formData,
      [itemName]: { ...formData[itemName], comment },
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleStatusChange = (itemName, status) => {
    const updatedData = {
      ...formData,
      [itemName]: {
        ...formData[itemName],
        inspection_status: status,
      },
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
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

  return (
    <div>
      <h1>7. ELECTRICAL</h1>
      <form>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
            
            <div className='item-header-name'>
              <h3>{item.name}</h3>
              <InspectionStatusDropdown
                  value={formData[item.name]?.inspection_status}
                  onChange={(status) => handleStatusChange(item.name, status)}
              />
            </div>

            <div className="flex-right">
              <div className="item-list">
                <strong>Material: </strong>
                {item.materials.map((material, idx) => (
                  <div key={`${item.name}-material-${idx}`} className="toggle-container">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData[item.name]?.materials?.[material] || false}
                        onChange={() => handleCheckboxChange(item.name, "materials", material)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="toggle-label">{material}</span>
                  </div>                           
                ))}
              </div>

              <div className="item-list">
                <strong>Condition: </strong>
                {item.condition.map((condition, idx) => (
                  <div key={`${item.name}-condition-${idx}`} className="toggle-container">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData[item.name]?.conditions?.[condition] || false}
                        onChange={() => handleCheckboxChange(item.name, "conditions", condition)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="toggle-label">{condition}</span>
                  </div>                                        
                ))}
              </div>
            </div>

            <div className="comment-box-container">
              <label>
                <strong>Comments:</strong>
                <textarea
                  className="comment-boxes"
                  value={formData[item.name]?.comment || ""}
                  onChange={(e) => {
                    handleCommentChange(item.name, e.target.value);
                    handleResize(e.target);
                  }}
                  ref={(el) => el && handleResize(el)}
                />
              </label>
            </div>

            <div className="photo-upload-container">
              <strong>Photos:</strong>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(item.name, e)}
              />
              <div className="photo-preview">
                {photos[item.name] && photos[item.name].length > 0 ? (
                  photos[item.name].map((photo) => (
                    <div key={photo.photo_id} className="photo-item">
                      <img
                        src={`http://localhost:8080${photo.photo_url}`}
                        alt={item.name}
                      />
                      <button type="button" onClick={() => handlePhotoRemove(item.name, photo.photo_id)}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No photos uploaded.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
};

export default Electrical;