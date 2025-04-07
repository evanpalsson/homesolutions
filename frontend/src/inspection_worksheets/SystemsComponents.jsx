import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import InspectionStatusDropdown from "../components/InspectionStatusDropdown";
import { InspectionCRUD } from "../components/InspectionCRUD";
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
    photos,
    fetchPhotos,
  } = InspectionCRUD(inspectionId, "systemsComponents");

  const items = useMemo(() => [
    {
      name: "Garage Door",
      materials: ["Chain Drive", "Belt Drive", "Screw Drive", "Direct Drive", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Reversing Issues", "No Remote"],
    },
    {
      name: "Ceiling Fans",
      materials: ["Wood Blades", "Metal Blades", "Remote Control", "Other (see comments)"],
      condition: ["Balanced", "Wobbly", "Noisy", "Inoperable"],
    },
    {
      name: "Central Vacuum",
      materials: ["Installed", "Wall Inlets", "Accessories Present", "Other (see comments)"],
      condition: ["Operational", "Clogged", "Low Suction", "Leaking"],
    },
    {
      name: "Doorbell",
      materials: ["Wired", "Wireless", "Video", "Other (see comments)"],
      condition: ["Functional", "No Sound", "Delayed", "Disconnected"],
    },
    {
      name: "Intercom",
      materials: ["Audio Only", "Video", "Room-to-Room", "Other (see comments)"],
      condition: ["Operational", "Static", "Unclear Audio", "Non-functional"],
    },
  ], []);

  useEffect(() => {
    if (inspectionId) {
      items.forEach(item => fetchPhotos(item.name));
    }
  }, [inspectionId, items, fetchPhotos]);

  return (
    <div>
      <h1>11. SYSTEMS & COMPONENTS</h1>
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

export default SystemsComponents;