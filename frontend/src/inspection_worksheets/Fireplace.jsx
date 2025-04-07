import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import InspectionStatusDropdown from "../components/InspectionStatusDropdown";
import { InspectionCRUD } from "../components/InspectionCRUD";
import "../styles/InspectionWorksheets.css";

const Fireplace = () => {
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
  } = InspectionCRUD(inspectionId, "fireplace");

  const items = useMemo(() => [
    {
      name: "Fireplace Type",
      materials: ["Wood Burning", "Gas", "Electric", "Pellet", "Other (see comments)"],
      condition: ["Operational", "Inoperable", "Excessive Creosote", "Draft Issues"],
    },
    {
      name: "Chimney - Vent",
      materials: ["Masonry", "Metal", "Direct Vent", "Power Vent", "Other (see comments)"],
      condition: ["Clear", "Blocked", "Damaged Flue", "Needs Cleaning"],
    },
    {
      name: "Damper",
      materials: ["Present", "Missing", "Inoperable", "Other (see comments)"],
      condition: ["Operational", "Stuck", "Missing", "Broken Handle"],
    },
    {
      name: "Firebox",
      materials: ["Brick", "Steel", "Cast Iron", "Other (see comments)"],
      condition: ["Good", "Cracked", "Leaking", "Corroded"],
    },
    {
      name: "Hearth",
      materials: ["Tile", "Stone", "Concrete", "Other (see comments)"],
      condition: ["Intact", "Cracked", "Loose", "Missing Tiles"],
    },
  ], []);

  useEffect(() => {
    if (inspectionId) {
      items.forEach(item => fetchPhotos(item.name));
    }
  }, [inspectionId, items, fetchPhotos]);

  return (
    <div>
      <h1>10. FIREPLACE</h1>
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

export default Fireplace;
