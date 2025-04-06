import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/InspectionWorksheets.css";

const Exterior = () => {
  const { inspectionId } = useParams(); 
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState({});

  // Stable items array.
  const items = useMemo(() => [
    {
      name: "Sidewalks",
      materials: ["Concrete", "Asphalt", "Brick", "Stone", "None"],
      condition: ["Cracked", "Settled", "Trip Hazard", "Uneven", "Spalling"],
    },
    {
      name: "Exterior Walls",
      materials: ["Brick", "Stone", "Stucco", "Wood", "Fiber-Cement", "Aluminum/Vinyl", "Other (see comments)"],
      condition: ["Cracked", "Rotting", "Peeling Paint", "Loose Siding", "Water Staining"],
    },
    {
      name: "Trim",
      materials: ["Brick", "Stone", "Stucco", "Wood", "Fiber-Cement", "Aluminum/Vinyl", "Other (see comments)"],
      condition: ["Loose", "Rotting", "Warped", "Missing Pieces", "Damaged Paint"],
    },
    {
      name: "Paths",
      materials: ["Concrete", "Stone", "Brick", "Asphalt", "Dirt/Soil", "Other (see comments)"],
      condition: ["Uneven", "Cracked", "Worn", "Eroded", "Overgrown"],
    },
    {
      name: "Steps",
      materials: ["Concrete", "Stone", "Brick", "Wood", "Handrail(s)", "Other (see comments)"],
      condition: ["Loose", "Cracked", "Rotting", "No Handrail", "Trip Hazard"],
    },
    {
      name: "Porch",
      materials: ["Cracked", "Rotting", "Chipped", "Loose"],
      condition: ["Settled", "Water Damage", "Rotting Posts", "Cracked Flooring", "Loose Railings"],
    },
    {
      name: "Windows",
      materials: ["Wood", "Aluminum"],
      condition: ["Broken Glass", "Fogged", "Leaking", "Rotting Frame", "Improper Seal"],
    },
    {
      name: "Storms & Screens",
      materials: ["Partial", "Full", "None"],
      condition: ["Damaged", "Missing", "Torn", "Non-Functional", "Poor Fit"],
    },
    {
      name: "Gutters & Downspouts",
      materials: ["Partial", "Full", "Built-in", "Aluminum", "Copper", "Galvanized", "Wood"],
      condition: ["Leaking", "Blocked", "Disconnected", "Missing", "Improper Slope"],
    },
    {
      name: "Chimney",
      materials: ["Brick", "Masonry", "Prefabricated"],
      condition: ["Cracked", "Leaning", "Damaged Crown", "Missing Cap", "Creosote Buildup"],
    },
    {
      name: "Garage",
      materials: ["Attached", "Detached", "Automatic opener"],
      condition: ["Door Inoperable", "Cracked Slab", "Sagging Roof", "Water Intrusion", "Loose Tracks"],
    },
    {
      name: "Driveway",
      materials: ["Asphalt", "Concrete", "Gravel", "Pavers", "Other (see comments)"],
      condition: ["Cracked", "Settled", "Potholes", "Heaved", "Eroded"],
    },
    {
      name: "Patio",
      materials: ["Concrete", "Stone", "Brick", "None"],
      condition: ["Cracked", "Sinking", "Worn Surface", "Missing Mortar", "Trip Hazard"],
    },
    {
      name: "Deck",
      materials: ["Composite", "Wood", "None"],
      condition: ["Loose Boards", "Rotting", "No Railing", "Nail Pops", "Structural Weakness"],
    },
    {
      name: "Landscaping",
      materials: ["Grass", "Tree(s) overhanging roof"],
      condition: ["Overgrown", "Poor Drainage", "Root Intrusion", "Blocked View", "Touching Structure"],
    },
    {
      name: "Retaining Walls",
      materials: ["Concrete", "Brick", "Stone", "Cinder Block", "Wood", "Other (see comments)"],
      condition: ["Leaning", "Cracked", "Failing Mortar", "No Drainage", "Bulging"],
    },
    {
      name: "Fencing",
      materials: ["Wood", "Metal", "Vinyl", "Chain Link", "Concrete", "Stone", "Brick", "None", "Other (see comments)"],
      condition: ["Leaning", "Missing Panels", "Rusting", "Loose Posts", "Broken Gate"],
    },
    {
      name: "Drainage & Grading",
      materials: ["Stairwell", "Window well", "Other (see comments)"],
      condition: ["Negative Slope", "Pooling Water", "Eroded Soil", "Blocked Drain", "Improper Swale"],
    },
  ], []);

  // Wrap fetchPhotos in useCallback so it doesn't change on every render.
  const fetchPhotos = useCallback(async (itemName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inspection-photo/${inspectionId}/${encodeURIComponent(itemName)}`);
      setPhotos(prev => ({ ...prev, [itemName]: response.data }));
    } catch (error) {
      console.error(`Error fetching photos for ${itemName}:`, error);
    }
  }, [inspectionId]);

  // Fetch photos for each item on mount/update.
  useEffect(() => {
    if (inspectionId) {
      items.forEach((item) => {
        fetchPhotos(item.name);
      });
    }
  }, [inspectionId, items, fetchPhotos]);

  // Fetch existing exterior worksheet data.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inspection-exterior/${inspectionId}`);
        const resData = response.data || []; // Default to empty array if null
        const data = resData.reduce((acc, item) => {
          acc[item.item_name] = {
            materials: item.materials,
            conditions: item.conditions || {},
            comment: item.comments || "",
          };
          return acc;
        }, {});
        setFormData(data);
      } catch (error) {
        console.error("Error fetching exterior data:", error);
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
      }));
      await axios.post("http://localhost:8080/api/inspection-exterior", payload);
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

  const handleResize = (textarea) => {
    textarea.style.height = "auto";  // Reset height to auto
    textarea.style.height = textarea.scrollHeight + "px"; // Set to scroll height
  };

  // Handler to upload photos for a given item.
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
        // Refresh photos for the item.
        fetchPhotos(itemName);
      } catch (error) {
        console.error(`Error uploading photo for ${itemName}:`, error);
      }
    }
    e.target.value = "";
  };

  // Handler to remove a photo.
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
      <h1>1. EXTERIOR</h1>
      <form>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
            <h3>{item.name}</h3>
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

            {/* PHOTO UPLOAD SECTION */}
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
                        src={`http://localhost:8080${photo.photo_url}`} // <- prepend backend domain + port
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

export default Exterior;
