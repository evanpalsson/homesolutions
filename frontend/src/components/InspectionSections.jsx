import React, { useEffect } from "react";
import { InspectionStatusDropdown } from "../components/InspectionCRUD";
import "../styles/InspectionWorksheets.css";

const InspectionSections = ({ items, formData, handlers, photos, fetchPhotos }) => {
  useEffect(() => {
    items.forEach((item) => fetchPhotos(item.name));
  }, [items, fetchPhotos]);

  // ✅ Patch to fix undefined componentTypeConditions BEFORE rendering
  items.forEach((item) => {
    if (!formData[item.name]) {
      formData[item.name] = {
        componentTypeConditions: {},
        comment: "",
        inspection_status: "Not Inspected",
      };
    } else {
      if (!formData[item.name].componentTypeConditions) {
        formData[item.name].componentTypeConditions = {};
      }
    }
  });

  const maybeAutoUpdateStatus = (itemName) => {
    const currentStatus = formData[itemName]?.inspection_status || "Not Inspected";
  
    if (currentStatus !== "Not Present" && currentStatus !== "Repair or Replace") {
      handlers.handleStatusChange(itemName, "Inspected");
    }
  };  

  const handleTypeCheckboxChange = (itemName, type) => {
    const existing = formData[itemName]?.componentTypeConditions || {};
    const isSelected = existing.hasOwnProperty(type);
  
    if (isSelected) {
      const updatedMapping = { ...existing };
      delete updatedMapping[type];
      handlers.updateComponentTypeConditions(itemName, updatedMapping);
    } else {
      handlers.updateComponentTypeConditions(itemName, {
        ...existing,
        [type]: "",
      });
      maybeAutoUpdateStatus(itemName); // ✅ trigger status update
    }
  };
  
  const handleConditionDropdownChange = (itemName, type, newCondition) => {
    const existing = formData[itemName]?.componentTypeConditions || {};
    handlers.updateComponentTypeConditions(itemName, {
      ...existing,
      [type]: newCondition,
    }, type, true);
    maybeAutoUpdateStatus(itemName); // ✅ trigger status update
  };  

  return (
    <form>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
          <div className="item-header-name">
            <h3>{item.name}</h3>
            <InspectionStatusDropdown
              value={formData[item.name]?.inspection_status || "Not Inspected"}
              onChange={(status) => handlers.handleStatusChange(item.name, status)}
            />
          </div>

          <div className="flex-right">
            {/* Component Types with Condition Mapping */}
            {item.componentTypes && item.componentTypes.length > 0 && (
              <div className="item-list">
                <strong>{item.label || "Component Type"}:</strong>
                {item.componentTypes.map((type, idx) => {
                  const isSelected = formData[item.name]?.componentTypeConditions?.hasOwnProperty(type);

                  return (
                    <div key={`${item.name}-component-${idx}`} className="toggle-wrapper">
                      <input
                        type="checkbox"
                        className="checkbox-square"
                        checked={isSelected}
                        onChange={() => handleTypeCheckboxChange(item.name, type)}
                      />
                      <span className="toggle-type-label">{type}</span>

                      <select
                        className={`condition-dropdown ${isSelected ? "visible" : ""}`}
                        value={formData[item.name]?.componentTypeConditions?.[type] || ""}
                        onChange={(e) => handleConditionDropdownChange(item.name, type, e.target.value)}
                      >
                        <option value="">Select Condition</option>
                        {item.condition.map((condition, idx2) => (
                          <option key={`${item.name}-condition-${idx2}`} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="comment-box-container">
            <label>
              <strong>Comments:</strong>
              <textarea
                className="comment-boxes"
                value={formData[item.name]?.comment || ""}
                onChange={(e) => {
                  handlers.handleCommentChange(item.name, e.target.value);
                  handlers.handleResize(e.target);
                  if (e.target.value.trim() !== "") {
                    maybeAutoUpdateStatus(item.name); // ✅ trigger status update
                  }
                }}
                ref={(el) => el && handlers.handleResize(el)}
              />
            </label>
          </div>

          {/* Photos Upload Section */}
          <div className="photo-upload-container">
            <strong>Photos: </strong>
            <div className="custom-file-upload">
              <button
                type="button"
                onClick={() => document.getElementById(`file-upload-${item.name}`).click()}
                className="upload-button"
              >
                Upload Photo(s)
              </button>
              <input
                id={`file-upload-${item.name}`}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handlers.handlePhotoUpload(item.name, e);
                  maybeAutoUpdateStatus(item.name);
                }}
              />
            </div>
            <div className="photo-preview">
              {photos[item.name]?.length > 0 ? (
                photos[item.name].map((photo) => (
                  <div key={photo.photo_id} className="photo-item">
                    <img src={`http://localhost:8080${photo.photo_url}`} alt={item.name} />
                    <button
                      type="button"
                      onClick={() => handlers.handlePhotoRemove(item.name, photo.photo_id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p></p>
              )}
            </div>
          </div>

        </div>
      ))}
    </form>
  );
};

export default InspectionSections;
