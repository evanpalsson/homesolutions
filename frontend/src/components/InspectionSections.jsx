import React, { useEffect } from "react";
import { InspectionStatusDropdown } from "../components/InspectionCRUD";
import "../styles/InspectionWorksheets.css";

const InspectionSections = ({ items, formData, handlers, photos, fetchPhotos }) => {
  useEffect(() => {
    items.forEach((item) => fetchPhotos(item.name));
  }, [items, fetchPhotos]);

  return (
    <form>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
          <div className='item-header-name'>
            <h3>{item.name}</h3>
            <InspectionStatusDropdown
              value={formData[item.name]?.inspection_status}
              onChange={(status) => handlers.handleStatusChange(item.name, status)}
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
                      onChange={() => handlers.handleCheckboxChange(item.name, "materials", material)}
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
                      onChange={() => handlers.handleCheckboxChange(item.name, "conditions", condition)}
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
                  handlers.handleCommentChange(item.name, e.target.value);
                  handlers.handleResize(e.target);
                }}
                ref={(el) => el && handlers.handleResize(el)}
              />
            </label>
          </div>

          <div className="photo-upload-container">
            <strong>Photos:</strong>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlers.handlePhotoUpload(item.name, e)}
            />
            <div className="photo-preview">
              {photos[item.name]?.length > 0 ? (
                photos[item.name].map((photo) => (
                  <div key={photo.photo_id} className="photo-item">
                    <img src={`http://localhost:8080${photo.photo_url}`} alt={item.name} />
                    <button type="button" onClick={() => handlers.handlePhotoRemove(item.name, photo.photo_id)}>
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
  );
};

export default InspectionSections;
