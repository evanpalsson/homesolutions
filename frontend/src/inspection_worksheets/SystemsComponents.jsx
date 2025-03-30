import React, { useEffect, useState, memo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/InspectionWorksheets.css';

function SystemsComponents() {
  const { inspectionId } = useParams();
  const [formData, setFormData] = useState({});

  const items = [
    {
      name: "Garage Door Opener",
      materials: ["Chain Drive", "Belt Drive", "Screw Drive", "Direct Drive", "Other (see comments)"],
      condition: ["Operational", "Non-functional", "Noisy", "Unsafe"],
    },
    {
      name: "Ceiling Fans",
      materials: ["Wood Blades", "Metal Blades", "Remote Control", "Other (see comments)"],
      condition: ["Functional", "Wobbly", "Noisy", "Inoperable"],
    },
    {
      name: "Central Vacuum",
      materials: ["Installed", "Wall Inlets", "Accessories Present", "Other (see comments)"],
      condition: ["Operational", "Clogged", "Leaking", "Non-functional"],
    },
    {
      name: "Doorbell",
      materials: ["Wired", "Wireless", "Video", "Other (see comments)"],
      condition: ["Functional", "No Sound", "Delayed", "Non-functional"],
    },
    {
      name: "Intercom",
      materials: ["Audio Only", "Video", "Room-to-Room", "Other (see comments)"],
      condition: ["Functional", "Static", "Non-functional", "Outdated"],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inspection-systemsComponents/${inspectionId}`);
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
        console.error("Error fetching systems & components data:", error);
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

      await axios.post("http://localhost:8080/api/inspection-systemsComponents", payload);
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
      <h1>11. SYSTEMS & COMPONENTS</h1>
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
}

export default memo(SystemsComponents);