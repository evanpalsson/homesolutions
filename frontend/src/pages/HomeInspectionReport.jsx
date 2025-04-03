import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/HomeInspectionReport.css";

const HomeInspectionReport = () => {
  const { propertyId, inspectionId } = useParams();

  // Existing state variables.
  const [propertyData, setPropertyData] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [exteriorData, setExteriorData] = useState([]);
  const [roofData, setRoofData] = useState([]);
  const [basementData, setBasementData] = useState([]);
  const [heatingData, setHeatingData] = useState([]);
  const [coolingData, setCoolingData] = useState([]);
  const [plumbingData, setPlumbingData] = useState([]);

  // New state variables for additional tables.
  const [electricalData, setElectricalData] = useState([]);
  const [atticData, setAtticData] = useState([]);
  const [doorsWindowsData, setDoorsWindowsData] = useState([]);
  const [fireplaceData, setFireplaceData] = useState([]);
  const [systemsComponentsData, setSystemsComponentsData] = useState([]);

  // Fetch property address.
  useEffect(() => {
    if (propertyId) {
      axios
        .get(`http://localhost:8080/api/get-address/${propertyId}`)
        .then((response) => setPropertyData(response.data))
        .catch((error) =>
          console.error("Error fetching property address:", error)
        );
    }
  }, [propertyId]);

  // Fetch inspection details.
  useEffect(() => {
    if (inspectionId && propertyId) {
      axios
        .get(`http://localhost:8080/api/inspection-details/${inspectionId}/${propertyId}`)
        .then((response) => setInspectionData(response.data))
        .catch((error) =>
          console.error("Error fetching inspection details:", error)
        );
    }
  }, [inspectionId, propertyId]);

  // Fetch exterior inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-exterior/${inspectionId}`)
        .then((response) => setExteriorData(response.data || []))
        .catch((error) =>
          console.error("Error fetching exterior data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch roof inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-roof/${inspectionId}`)
        .then((response) => setRoofData(response.data || []))
        .catch((error) =>
          console.error("Error fetching roof data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch basement/foundation inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-basementFoundation/${inspectionId}`)
        .then((response) => setBasementData(response.data || []))
        .catch((error) =>
          console.error("Error fetching basement/foundation data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch heating inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-heating/${inspectionId}`)
        .then((response) => setHeatingData(response.data || []))
        .catch((error) =>
          console.error("Error fetching heating data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch cooling inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-cooling/${inspectionId}`)
        .then((response) => setCoolingData(response.data || []))
        .catch((error) =>
          console.error("Error fetching cooling data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch plumbing inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-plumbing/${inspectionId}`)
        .then((response) => setPlumbingData(response.data || []))
        .catch((error) =>
          console.error("Error fetching plumbing data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch electrical inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-electrical/${inspectionId}`)
        .then((response) => setElectricalData(response.data || []))
        .catch((error) =>
          console.error("Error fetching electrical data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch attic inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-attic/${inspectionId}`)
        .then((response) => setAtticData(response.data || []))
        .catch((error) =>
          console.error("Error fetching attic data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch doors & windows inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-doorsWindows/${inspectionId}`)
        .then((response) => setDoorsWindowsData(response.data || []))
        .catch((error) =>
          console.error("Error fetching doors/windows data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch fireplace inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-fireplace/${inspectionId}`)
        .then((response) => setFireplaceData(response.data || []))
        .catch((error) =>
          console.error("Error fetching fireplace data:", error)
        );
    }
  }, [inspectionId]);

  // Fetch systems components inspection data.
  useEffect(() => {
    if (inspectionId) {
      axios
        .get(`http://localhost:8080/api/inspection-systemsComponents/${inspectionId}`)
        .then((response) => setSystemsComponentsData(response.data || []))
        .catch((error) =>
          console.error("Error fetching systems components data:", error)
        );
    }
  }, [inspectionId]);

  // Helper function to render an item.
  // It displays the item_name as the header, then "Materials" and "Conditions" subheaders with only keys where the value is true.
  const renderItem = (item) => {
    const itemName = item.item_name || item.itemName; // Use item_name from the database
    return (
      <div className="item">
        {itemName && <h3 className="item-name">{itemName}</h3>}
        {item.materials &&
          Object.keys(item.materials).filter((key) => item.materials[key]).length > 0 && (
            <div className="item-materials">
              <h4>Materials</h4>
              <ul>
                {Object.entries(item.materials)
                  .filter(([key, value]) => value)
                  .map(([key]) => (
                    <li key={key}>{key}</li>
                  ))}
              </ul>
            </div>
          )}
        {item.conditions &&
          Object.keys(item.conditions).filter((key) => item.conditions[key]).length > 0 && (
            <div className="item-conditions">
              <h4>Conditions</h4>
              <ul>
                {Object.entries(item.conditions)
                  .filter(([key, value]) => value)
                  .map(([key]) => (
                    <li key={key}>{key}</li>
                  ))}
              </ul>
            </div>
          )}
        {item.comments && item.comments.trim() !== "" && (
          <p className="item-comments">
            <strong>Comments:</strong> {item.comments}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="report-container">
      {/* COVER PAGE */}
      <section className="cover-page">
        <div className="cover-header">
          <h1>INSPECTION REPORT</h1>
          <h2>{propertyData ? propertyData.street : "Loading address..."}</h2>
          <h3>
            {propertyData
              ? `${propertyData.city} ${propertyData.state} ${propertyData.postal_code}`
              : ""}
          </h3>
        </div>
        <div className="cover-details">
          <div className="inspected-by">
            <h4>INSPECTED BY</h4>
            <p>Russell Buchanan</p>
            <p>HomeGauge Software</p>
          </div>
          <div className="inspection-date">
            <h4>INSPECTION DATE</h4>
            <p>
              {inspectionData
                ? inspectionData.inspection_date
                : "Loading date..."}
            </p>
            <p>
              {inspectionData && inspectionData.inspection_time
                ? inspectionData.inspection_time
                : "1:00 PM"}
            </p>
          </div>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section className="table-of-contents">
        <h2>TABLE OF CONTENTS</h2>
        <ul>
          <li>Cover Page ........................................................ 1</li>
          <li>Table of Contents .............................................. 2</li>
          <li>Intro Page ........................................................ 3</li>
          <li>1. Roofing ........................................................... 4</li>
          <li>2. Exterior ......................................................... 6</li>
          <li>3. Structural Components ........................................ 7</li>
          <li>4. Heating / Central Air Conditioning ....................... 8</li>
          <li>5. Plumbing System .............................................. 9</li>
          <li>6. Electrical System .............................................. 10</li>
          <li>7. Attic .............................................................. 11</li>
          <li>8. Doors & Windows ................................................ 12</li>
          <li>9. Fireplace ........................................................ 13</li>
          <li>10. Systems Components ......................................... 14</li>
          <li>Summary .............................................................. 20</li>
        </ul>
      </section>

      {/* INTRO PAGE */}
      <section className="intro-page">
        <h2>Intro Page</h2>
        <div className="general-info">
          <h3>GENERAL INFO</h3>
          <p>
            <strong>Property Address:</strong>{" "}
            {propertyData
              ? `${propertyData.street}, ${propertyData.city}, ${propertyData.state} ${propertyData.postal_code}`
              : "Loading address..."}
          </p>
          <p>
            <strong>Date of Inspection:</strong>{" "}
            {inspectionData ? inspectionData.inspection_date : "Loading..."}
          </p>
          <p>
            <strong>Report ID:</strong>{" "}
            {inspectionData ? inspectionData.inspection_id : "N/A"}
          </p>
          <p>
            <strong>Customer(s):</strong> Sample Buyer
          </p>
          <p>
            <strong>Time of Inspection:</strong>{" "}
            {inspectionData && inspectionData.inspection_time
              ? inspectionData.inspection_time
              : "1:00 PM"}
          </p>
          <p>
            <strong>Real Estate Agent:</strong> Nath Dau-Schmidt, DauSchmidt Realty
          </p>
        </div>
        <div className="inspection-details">
          <h3>INSPECTION DETAILS</h3>
          <p>
            <strong>In Attendance:</strong> Customer and their agent
          </p>
          <p>
            <strong>Type of Building:</strong> Single Family (2 story)
          </p>
          <p>
            <strong>Approximate Age:</strong> Over 10 Years
          </p>
          <p>
            <strong>Temperature:</strong>{" "}
            {inspectionData && inspectionData.temperature
              ? `${inspectionData.temperature}°F`
              : "N/A"}
          </p>
          <p>
            <strong>Weather:</strong>{" "}
            {inspectionData && inspectionData.weather
              ? inspectionData.weather
              : "N/A"}
          </p>
          <p>
            <strong>Ground/Soil Surface Condition:</strong>{" "}
            {inspectionData && inspectionData.ground_condition
              ? inspectionData.ground_condition
              : "N/A"}
          </p>
          <p>
            <strong>Rain in Last 3 Days:</strong>{" "}
            {inspectionData && inspectionData.rain_last_three_days !== undefined
              ? inspectionData.rain_last_three_days
                ? "Yes"
                : "No"
              : "N/A"}
          </p>
          <p>
            <strong>Radon Test:</strong>{" "}
            {inspectionData && inspectionData.radon_test !== undefined
              ? inspectionData.radon_test
                ? "Yes"
                : "No"
              : "N/A"}
          </p>
          <p>
            <strong>Mold Test:</strong>{" "}
            {inspectionData && inspectionData.mold_test !== undefined
              ? inspectionData.mold_test
                ? "Yes"
                : "No"
              : "N/A"}
          </p>
        </div>
        <div className="comment-key">
          <h3>Comment Key or Definitions</h3>
          <ul>
            <li>
              <strong>Inspected (IN):</strong> Visually observed and functioning as intended.
            </li>
            <li>
              <strong>Not Inspected (NI):</strong> Not inspected; reason provided.
            </li>
            <li>
              <strong>Not Present (NP):</strong> Not present in the property.
            </li>
            <li>
              <strong>Repair or Replace (RR):</strong> Not functioning properly; needs repair or further inspection.
            </li>
          </ul>
        </div>
      </section>

      {/* ROOFING SECTION */}
      {roofData && roofData.length > 0 && (
        <section className="section roofing">
          <h2>1. Roofing</h2>
          {roofData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* EXTERIOR SECTION */}
      {exteriorData && exteriorData.length > 0 && (
        <section className="section exterior">
            <h2>2. Exterior</h2>
            {exteriorData.map((item, index) => (
            <div key={index} className="item">
                {renderItem(item)}
            </div>
            ))}
        </section>
        )}

      {/* STRUCTURAL COMPONENTS SECTION */}
      {basementData && basementData.length > 0 && (
        <section className="section structural">
          <h2>3. Structural Components</h2>
          {basementData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* HEATING / CENTRAL AIR CONDITIONING SECTION */}
      <section className="section hvac">
        <h2>4. Heating / Central Air Conditioning</h2>
        {/* Heating Subsection */}
        {heatingData && heatingData.length > 0 && (
          <div className="heating-section">
            <h3>Heating</h3>
            {heatingData.map((item, index) => (
              <div key={index} className="item">
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
        {/* Cooling Subsection */}
        {coolingData && coolingData.length > 0 && (
          <div className="cooling-section">
            <h3>Cooling</h3>
            {coolingData.map((item, index) => (
              <div key={index} className="item">
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PLUMBING SYSTEM SECTION */}
      {plumbingData && plumbingData.length > 0 && (
        <section className="section plumbing">
          <h2>5. Plumbing System</h2>
          {plumbingData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* ELECTRICAL SYSTEM SECTION */}
      {electricalData && electricalData.length > 0 && (
        <section className="section electrical">
          <h2>6. Electrical System</h2>
          {electricalData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* ATTIC SECTION */}
      {atticData && atticData.length > 0 && (
        <section className="section attic">
          <h2>7. Attic</h2>
          {atticData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* DOORS & WINDOWS SECTION */}
      {doorsWindowsData && doorsWindowsData.length > 0 && (
        <section className="section doors-windows">
          <h2>8. Doors & Windows</h2>
          {doorsWindowsData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* FIREPLACE SECTION */}
      {fireplaceData && fireplaceData.length > 0 && (
        <section className="section fireplace">
          <h2>9. Fireplace</h2>
          {fireplaceData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      {/* SYSTEMS COMPONENTS SECTION */}
      {systemsComponentsData && systemsComponentsData.length > 0 && (
        <section className="section systems-components">
          <h2>10. Systems Components</h2>
          {systemsComponentsData.map((item, index) => (
            <div key={index} className="item">
              {renderItem(item)}
            </div>
          ))}
        </section>
      )}

      <footer className="report-footer">
        <p>&copy; Total Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Helper function to render an item with its materials and conditions.
// const renderItem = (item) => {
//   return (
//     <div className="item">
//       {item.itemName && <h3 className="item-name">{item.itemName}</h3>}
//       {item.materials &&
//         Object.keys(item.materials).filter((key) => item.materials[key])
//           .length > 0 && (
//           <div className="item-materials">
//             <h4>Materials</h4>
//             <ul>
//               {Object.entries(item.materials)
//                 .filter(([key, value]) => value)
//                 .map(([key]) => (
//                   <li key={key}>{key}</li>
//                 ))}
//             </ul>
//           </div>
//         )}
//       {item.conditions &&
//         Object.keys(item.conditions).filter((key) => item.conditions[key])
//           .length > 0 && (
//           <div className="item-conditions">
//             <h4>Conditions</h4>
//             <ul>
//               {Object.entries(item.conditions)
//                 .filter(([key, value]) => value)
//                 .map(([key]) => (
//                   <li key={key}>{key}</li>
//                 ))}
//             </ul>
//           </div>
//         )}
//       {item.comments && item.comments.trim() !== "" && (
//         <p className="item-comments">
//           <strong>Comments:</strong> {item.comments}
//         </p>
//       )}
//     </div>
//   );
// };

export default HomeInspectionReport;
