import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/InspectionWorksheets.css";

const Exterior = () => {
  const { inspectionId } = useParams(); 
  const [formData, setFormData] = useState({});

  const items = [
    {
      name: "Sidewalks",
      materials: ["Concrete", "Asphalt", "Brick", "Stone", "None"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Exterior Walls",
      materials: ["Brick", "Stone", "Stucco", "Wood", "Fiber-Cement", "Aluminum/Vinyl", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Trim",
      materials: ["Brick", "Stone", "Stucco", "Wood", "Fiber-Cement", "Aluminum/Vinyl", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Paths",
      materials: ["Concrete", "Stone", "Brick", "Asphalt", "Dirt/Soil", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Steps",
      materials: ["Concrete", "Stone", "Brick", "Wood", "Handrail(s)", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Porch",
      materials: ["Cracked", "Rotting", "Chipped", "Loose"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Windows",
      materials: ["Wood", "Aluminum"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Storms & Screens",
      materials: ["Partial", "Full", "None"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Gutters & Downspouts",
      materials: ["Partial", "Full", "Built-in", "Aluminum", "Copper", "Galvanized", "Wood"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Chimney",
      materials: ["Brick", "Masonry", "Prefabricated"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Garage",
      materials: ["Attached", "Detached", "Automatic opener"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Driveway",
      materials: ["Asphalt", "Concrete", "Gravel", "Pavers", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Patio",
      materials: ["Concrete", "Stone", "Brick", "None"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Deck",
      materials: ["Composite", "Wood", "None"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Landscaping",
      materials: ["Grass", "Tree(s) overhanging roof"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Retaining Walls",
      materials: ["Concrete", "Brick", "Stone", "Cinder Block", "Wood", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Fencing",
      materials: ["Wood", "Metal", "Vinyl", "Chain Link", "Concrete", "Stone", "Brick", "None", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
    {
      name: "Drainage & Grading",
      materials: [ "Stairwell", "Window well", "Other (see comments)"],
      condition: ["Good", "Fair", "Poor", "Non-functional", "Hazardous"],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inspection-exterior/${inspectionId}`);
        const data = response.data.reduce((acc, item) => {
          acc[item.item_name] = {
            materials: item.materials,
            conditions: item.conditions || {},  // New
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
  
      // console.log("Payload being sent to backend:", JSON.stringify(payload, null, 2));
  
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
                      handleResize(e.target); // Auto-resize the textarea
                    }}
                    ref={(el) => el && handleResize(el)} // Set initial size when rendered
                  />
              </label>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
};

export default Exterior;