import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import InspectionStatusDropdown from "../components/InspectionStatusDropdown";
import { InspectionCRUD } from "../components/InspectionCRUD";
import "../styles/InspectionWorksheets.css";

const Exterior = () => {
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
  } = InspectionCRUD(inspectionId, "exterior");

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

  useEffect(() => {
    if (inspectionId) {
      items.forEach(item => fetchPhotos(item.name));
    }
  }, [inspectionId, items, fetchPhotos]);

  return (
    <div>
      <h1>1. EXTERIOR</h1>
      <form>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>

            <div className="item-header-name">
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

export default Exterior;
