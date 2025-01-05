import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Exterior.css";

const Exterior = () => {
  const { inspectionId } = useParams(); // Get dynamic inspection_id
  const [formData, setFormData] = useState({});

  const items = [
    {
      name: "Sidewalks",
      materials: ["Concrete", "Asphalt", "Stone", "Cracked", "Uneven", "None"],
    },
    {
      name: "Exterior Walls",
      materials: ["Brick", "Stucco", "Stone", "Wood Siding", "Fiber-Cement Siding", "Aluminum/Vinyl Siding", "Vines Growing", "Other (see comments)"],
    },
    {
      name: "Trim",
      materials: ["Cracked", "Rotting", "Broken", "Loose", "Needs Paint Touch-Up"],
    },
    {
      name: "Paths",
      materials: ["Concrete", "Stone", "Brick", "Asphalt", "Cracked", "Settled", "Overgrown", "Other (see comments)"],
    },
    {
      name: "Steps",
      materials: ["Concrete", "Stone", "Brick", "Wood", "Need Repair", "Handrail(s)", "Other (see comments)"],
    },
    {
      name: "Porch",
      materials: ["Cracked", "Rotting", "Chipped", "Loose"],
    },
    {
      name: "Windows",
      materials: ["Wood", "Aluminum", "Cracked", "Broken", "Reputty", "Broken cords", "Need lubrication/adjustment", "Do not close properly", "Corroding/Rotting frames", "Thermal Panes", "Faulty seals"],
    },
    {
      name: "Storms & Screens",
      materials: ["Partial", "Full", "Cracked", "Broken", "Torn screens", "None"],
    },
    {
      name: "Roof",
      materials: ["Asphalt", "Wood", "Slate", "Tile", "Roll roofing", "Metal", "Other (see comments)", "Missing", "Loose", "Cracked", "Aging", "Eroded"],
    },
    {
      name: "Gutters & Downspouts",
      materials: ["Partial", "Full", "Built-in", "Aluminum", "Copper", "Galvanized", "Wood", "Loose/Sagging", "Open joints", "Need splash plates/elbows", "Need cleaning"],
    },
    {
      name: "Chimney",
      materials: ["Brick", "Masonry", "Prefabricated", "Needs repair"],
    },
    {
      name: "Garage",
      materials: ["Attached", "Detached", "Car occupancy", "Operational", "Need lubrication/adjustment", "Automatic opener"],
    },
    {
      name: "Driveway",
      materials: ["Cracked", "Uneven", "Broken", "Heaving", "Drain"],
    },
    {
      name: "Patio",
      materials: ["Concrete", "Stone", "Brick", "Needs repair", "Cracked", "Settled"],
    },
    {
      name: "Deck",
      materials: ["Attached", "Free-standing", "Composite", "Wood", "Cracked", "Rotting", "Broken", "Needs additional bracing", "Loose railings/handrails", "Loose steps", "Loose posts", "Needs CO"],
    },
    {
      name: "Landscaping",
      materials: ["Grass needs recultivation", "Shrubs need pruning", "Tree(s) overhanging roof", "Tree(s) need pruning", "Tree(s) dead/dying"],
    },
    {
      name: "Retaining Walls",
      materials: ["Brick", "Stone", "Concrete block", "Wood", "Need repair"],
    },
    {
      name: "Fencing",
      materials: ["Wood", "Metal", "Plastic", "Broken", "Rotting/Rusting", "Needs painting"],
    },
    {
      name: "Drainage & Grading",
      materials: ["Satisfactory", "Poor", "Low spots", "Needs regrading", "Stairwell", "Window well"],
    },
    {
      name: "Termites",
      materials: ["No visible evidence", "Visible evidence (see comments)"],
    },
    {
      name: "Caulking Around Exterior Joints",
      materials: ["Not needed", "Needed (see comments)"],
    },
  ];

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/inspection-exterior/${inspectionId}`);
        const data = response.data.reduce((acc, item) => {
          acc[item.item_name] = {
            materials: item.materials,
            condition: item.item_condition || "",
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

  // Debounce update to backend
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
        item_condition: details.condition || "",
        comments: details.comment || "",
      }));

      console.log("Payload being sent to backend:", JSON.stringify(payload, null, 2));

      await axios.post("http://localhost:8080/api/inspection-exterior", payload);
    } catch (error) {
      console.error("Error updating backend:", error);
    }
  };

  const debouncedUpdate = debounce(updateBackend, 500);

  // Handle form changes
  const handleCheckboxChange = (itemName, material) => {
    const updatedData = {
      ...formData,
      [itemName]: {
        ...formData[itemName],
        materials: {
          ...formData[itemName]?.materials,
          [material]: !formData[itemName]?.materials?.[material],
        },
      },
    };
    setFormData(updatedData);
    debouncedUpdate(updatedData);
  };

  const handleConditionChange = (itemName, condition) => {
    if (!condition) {
      console.error(`No condition selected for item: ${itemName}`);
      return; // Prevent empty conditions from being set
    }
  
    const updatedData = {
      ...formData,
      [itemName]: { ...formData[itemName], condition: condition.toUpperCase() },
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

  return (
    <div>
      <h1>1. EXTERIOR</h1>
      <form>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
            <h3>{item.name}</h3>

            <div>
              <strong>Materials:</strong>
              {item.materials.map((material, idx) => (
                <label key={idx} style={{ marginRight: "10px" }}>
                  <input
                    type="checkbox"
                    checked={formData[item.name]?.materials?.[material] || false}
                    onChange={() => handleCheckboxChange(item.name, material)}
                  />
                  {material}
                </label>
              ))}
            </div>

            <div style={{ marginTop: "10px" }}>
              <label>
                <strong>Condition:</strong>
                <select
                  value={formData[item.name]?.condition || ""}
                  onChange={(e) => handleConditionChange(item.name, e.target.value)}
                >
                  <option value="" disabled>Select Condition</option>
                  <option value="IN">Inspected (IN)</option>
                  <option value="NI">Not Inspected (NI)</option>
                  <option value="NP">Not Present (NP)</option>
                  <option value="RR">Repair or Replace (RR)</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: "10px" }}>
              <label>
                <strong>Comments:</strong>
                <textarea
                  rows="3"
                  style={{ width: "100%" }}
                  value={formData[item.name]?.comment || ""}
                  onChange={(e) => handleCommentChange(item.name, e.target.value)}
                />
              </label>
            </div>
          </div>
        ))}

        {/* <button type="button" onClick={handleSubmit}>
          Submit
        </button> */}
      </form>
    </div>
  );
};

export default Exterior;
