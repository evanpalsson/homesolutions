import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/HomeInspectionReport.css";

const HomeInspectionReport = () => {
  const { propertyId, inspectionId } = useParams();
  const [propertyData, setPropertyData] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [photosByItem, setPhotosByItem] = useState({});
  const [sectionData, setSectionData] = useState({});

  const sections = useMemo(() => [
    "roof",
    "exterior",
    "basementFoundation",
    "heating",
    "cooling",
    "plumbing",
    "electrical",
    "attic",
    "doorsWindows",
    "fireplace",
    "systemsComponents",
  ], []);

  const sectionTitles = {
    roof: "1. ROOFING",
    exterior: "2. EXTERIOR",
    basementFoundation: "3. STRUCTURAL COMPONENTS",
    heating: "4. HVAC - HEATING",
    cooling: "5. HVAC - COOLING",
    plumbing: "6. PLUMBING SYSTEM",
    electrical: "7. ELECTRICAL SYSTEM",
    attic: "8. ATTIC",
    doorsWindows: "9. DOORS & WINDOWS",
    fireplace: "10. FIREPLACE",
    systemsComponents: "11. SYSTEMS & COMPONENTS",
  };

  useEffect(() => {
    if (!inspectionId || !propertyId) return;

    axios.get(`http://localhost:8080/api/get-address/${propertyId}`)
      .then(res => setPropertyData(res.data))
      .catch(err => console.error("Address fetch error:", err));

    axios.get(`http://localhost:8080/api/inspection-details/${inspectionId}/${propertyId}`)
      .then(res => setInspectionData(res.data))
      .catch(err => console.error("Inspection fetch error:", err));

    sections.forEach(section => {
      axios.get(`http://localhost:8080/api/inspection-${section}/${inspectionId}`)
        .then(res => {
          setSectionData(prev => ({ ...prev, [section]: res.data || [] }));
        })
        .catch(err => console.error(`Error fetching ${section}:`, err));
    });

    axios.get(`http://localhost:8080/api/inspection-photo-all/${inspectionId}`)
      .then(res => {
        const grouped = {};
        res.data.forEach(photo => {
          if (!grouped[photo.item_name]) grouped[photo.item_name] = [];
          grouped[photo.item_name].push(photo);
        });
        setPhotosByItem(grouped);
      })
      .catch(err => console.error("Photo fetch error:", err));
  }, [inspectionId, propertyId, sections]);

  const renderItem = (item, indexPrefix) => {
    const itemName = item.item_name || item.itemName;
    return (
      <div className="inspection-item" key={itemName}>
        <h3 className="item-header">Item {indexPrefix} {itemName}</h3>
        {item.materials && Object.keys(item.materials).some(key => item.materials[key]) && (
          <div className="item-block">
            <strong>Style & Materials:</strong>
            <ul>
              {Object.entries(item.materials).filter(([_, val]) => val).map(([mat]) => <li key={mat}>{mat}</li>)}
            </ul>
          </div>
        )}
        {item.conditions && Object.keys(item.conditions).some(key => item.conditions[key]) && (
          <div className="item-block">
            <strong>Conditions:</strong>
            <ul>
              {Object.entries(item.conditions).filter(([_, val]) => val).map(([cond]) => <li key={cond}>{cond}</li>)}
            </ul>
          </div>
        )}
        {photosByItem[itemName] && (
          <div className="item-photos">
            <div className="photo-gallery">
              {photosByItem[itemName].map(photo => (
                <img
                  key={photo.photo_id}
                  src={`http://localhost:8080${photo.photo_url}`}
                  alt={itemName}
                  className="report-photo"
                />
              ))}
            </div>
          </div>
        )}
        {item.comments && item.comments.trim() !== "" && (
          <div className="item-block">
            <strong>Comments:</strong>
            <p>{item.comments}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="report-wrapper">
      <section className="cover-page">
        <div className="cover-title">
          <h1>INSPECTION REPORT</h1>
          <h2>{propertyData?.street}</h2>
          <h3>{propertyData ? `${propertyData.city}, ${propertyData.state} ${propertyData.postal_code}` : ""}</h3>
        </div>
        <div className="cover-meta">
          <div>
            <h4>INSPECTED BY:</h4>
            <p>Russell Buchanan</p>
            <p>HomeGauge Software</p>
          </div>
          <div>
            <h4>INSPECTION DATE:</h4>
            <p>{inspectionData?.inspection_date}</p>
            <p>{inspectionData?.inspection_time}</p>
          </div>
        </div>
      </section>

      {sections.map((section, sectionIdx) => {
        const data = sectionData[section];
        const hasPhotos = data?.some(item => photosByItem[item.item_name || item.itemName]);
        if ((!data || data.length === 0) && !hasPhotos) return null;

        return (
          <section key={section} className="report-section">
            <h2 className="section-header">{sectionTitles[section]}</h2>
            {data.map((item, idx) => {
              const prefix = `${sectionTitles[section].split(".")[0]}.${idx + 1}`;
              return renderItem(item, prefix);
            })}
          </section>
        );
      })}

      <footer className="report-footer">
        <p>© Total Home Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomeInspectionReport;
