import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/InspectionWorksheets.css";

const Electrical = () => {
  const { inspectionId } = useParams(); 
  const [formData, setFormData] = useState({});

  const items = [
    {
      name: "Service Panel",
      materials: ["Circuit Breakers", "Fuses", "Subpanel", "Main Panel", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Overloaded", "Hazardous"],
    },
    {
      name: "Wiring",
      materials: ["Copper", "Aluminum", "Knob & Tube", "BX", "Romex", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Exposed", "Hazardous"],
    },
    {
      name: "Outlets & Switches",
      materials: ["GFCI", "AFCI", "Ungrounded", "Three-prong", "Other (see comments)"],
      condition: ["Functional", "Non-functional", "Loose", "Missing Covers"],
    },
    {
      name: "Lighting",
      materials: ["Ceiling", "Wall-mounted", "Recessed", "Track", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Flickering", "Damaged"],
    },
    {
      name: "Smoke/CO Detectors",
      materials: ["Smoke", "CO", "Combo Unit", "Battery-powered", "Hardwired"],
      condition: ["Present", "Missing", "Non-functional", "Expired"],
    },
  ];

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

  const handleResize = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };  

  return (
    <div>
      <h1>7. ELECTRICAL</h1>
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
          </div>
        ))}
      </form>
    </div>
  );
};

export default Electrical;