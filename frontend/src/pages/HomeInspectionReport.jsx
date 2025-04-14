import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/HomeInspectionReport.css";

const HomeInspectionReport = () => {
  const { propertyId, inspectionId } = useParams();
  const [propertyData, setPropertyData] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [photosByItem, setPhotosByItem] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [propertyPhotoUrl, setPropertyPhotoUrl] = useState(null);

  const sections = useMemo(() => [
    "roof", "exterior", "basementFoundation", "heating", "cooling",
    "plumbing", "electrical", "attic", "doorsWindows", "fireplace", "systemsComponents"
  ], []);

  const sectionTitles = {
    roof: "ROOFING", exterior: "EXTERIOR", basementFoundation: "STRUCTURAL COMPONENTS",
    heating: "HVAC - HEATING", cooling: "HVAC - COOLING", plumbing: "PLUMBING SYSTEM",
    electrical: "ELECTRICAL SYSTEM", attic: "ATTIC", doorsWindows: "DOORS & WINDOWS",
    fireplace: "FIREPLACE", systemsComponents: "SYSTEMS & COMPONENTS"
  };

  useEffect(() => {
    if (!inspectionId || !propertyId) return;

    const fetchData = async () => {
      try {
        const [addressRes, detailsRes] = await Promise.all([
          axios.get(`/get-address/${propertyId}`),
          axios.get(`/inspection-details/${inspectionId}/${propertyId}`)
        ]);

        const propertyDetailsRes = await axios.get(`/property-details/${propertyId}/${inspectionId}`);
        setPropertyData({ ...addressRes.data, ...propertyDetailsRes.data });
        setInspectionData(detailsRes.data);

        const sectionResults = await Promise.all(
          sections.map(section =>
            axios.get(`/inspection-${section}/${inspectionId}`)
              .then(res => ({ section, data: res.data || [] }))
              .catch(() => ({ section, data: [] }))
          )
        );
        const sectionMap = {};
        sectionResults.forEach(({ section, data }) => {
          sectionMap[section] = data;
        });
        setSectionData(sectionMap);

        const photoRes = await axios.get(`/inspection-photo-all/${inspectionId}`);
        const grouped = {};
        (photoRes.data || []).forEach(photo => {
          if (!grouped[photo.item_name]) grouped[photo.item_name] = [];
          grouped[photo.item_name].push(photo);
        });
        setPhotosByItem(grouped);

        const coverRes = await axios.get(`/property-photo/${inspectionId}`);
        if (Array.isArray(coverRes.data) && coverRes.data.length > 0) {
          const rawUrl = coverRes.data[0].photo_url;
          setPropertyPhotoUrl(`http://localhost:8080/${rawUrl.replace(/^\/+/, "")}`);
        } else {
          setPropertyPhotoUrl("/images/placeholder.png");
        }
      } catch (err) {
        console.error("Error fetching inspection report data:", err);
      }
    };

    fetchData();
  }, [inspectionId, propertyId, sections]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00Z");
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "2-digit", timeZone: "UTC"
    });
  };

  const renderItem = (item, indexPrefix) => {
    const itemName = item.item_name || item.itemName;
    const materialList = item.materials
      ? Object.keys(item.materials).filter(key => item.materials[key]).join(", ")
      : "";
    const conditionList = item.conditions
      ? Object.keys(item.conditions).filter(key => item.conditions[key]).join(", ")
      : "";

    return (
      <div className={`inspection-item ${item.inspection_status?.replace(/\s/g, '-') || "Not-Inspected"}`} key={itemName}>
        <div className="item-header-line">
          <h3 className="item-header">{indexPrefix} {itemName}</h3>
          <span className={`status-pill ${item.inspection_status || "Not Inspected"}`}>
            {item.inspection_status || "Not Inspected"}
          </span>
        </div>

        <div className="item-details">
          {materialList && (
            <div className="item-block">
              <strong>Styles & Materials:</strong> {materialList}
            </div>
          )}
          {conditionList && (
            <div className="item-block">
              <strong>Condition:</strong> {conditionList}
            </div>
          )}
        </div>

        {item.comments && item.comments.trim() !== "" && (
          <div className="item-block">
            <strong>Observation:</strong> {item.comments}
          </div>
        )}

        {(photosByItem[itemName] || []).map(photo => (
          <img
            key={photo.photo_id}
            src={`http://localhost:8080/${photo.photo_url}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/placeholder.png";
            }}
            alt="Item"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="report-wrapper">
      <section className="cover-page">
        <div className="cover-title">
          <h1 className="property-type">
            {propertyData?.property_type || "PROPERTY"} INSPECTION REPORT
          </h1>
        </div>
        {propertyPhotoUrl && (
          <div className="property-photo-container">
            <div className="property-photo-wrapper">
              <img
                src={propertyPhotoUrl}
                alt="Property"
                className="property-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/house_placeholder.png";
                }}
              />
              <div className="property-overlay-text">
                <div className="opacity-overlay"></div>
                <h2 className="overlay-address">{propertyData?.street}</h2>
                <h2 className="overlay-city">
                  {propertyData ? `${propertyData.city}, ${propertyData.state} ${propertyData.postal_code}` : ""}
                </h2>
                <div className="overlay-inspector">
                  <h3>INSPECTED BY</h3>
                  <h4>Placeholder</h4>
                  <h4>H3 Inspections</h4>
                </div>
                <div className="overlay-date">
                  <h3>INSPECTION DATE</h3>
                  <h4>{formatDate(inspectionData?.inspection_date)}</h4>
                  <h4>{inspectionData?.inspection_time}</h4>
                </div>
                <div className="overlay-reportid">
                  <h3>REPORT#</h3>
                  <h4>{inspectionData?.report_id || "Loading..."}</h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {propertyData && (
        <section className="report-summary">
          <h2 className="section-header property-info">PROPERTY INFO</h2>
          <div className="overview-grid">
            <div><strong>Property Type:</strong> {propertyData.property_type || "N/A"}</div>
            <div><strong>Year Built:</strong> {propertyData.year_built || "N/A"}</div>
            <div><strong>Square Footage:</strong> {propertyData.square_footage ? `${propertyData.square_footage} sq ft` : "N/A"}</div>
            <div><strong>Lot Size:</strong> {propertyData.lot_size ? `${propertyData.lot_size} acres` : "N/A"}</div>
            <div><strong>Bedrooms:</strong> {propertyData.bedrooms || "N/A"}</div>
            <div><strong>Bathrooms:</strong> {propertyData.bathrooms || "N/A"}</div>
          </div>
        </section>
      )}

      {inspectionData && (
        <section className="report-summary">
          <h2 className="section-header inspection-overview">INSPECTION OVERVIEW</h2>
          <div className="overview-grid">
            <div><strong>Inspection Date:</strong> {formatDate(inspectionData?.inspection_date)}</div>
            <div><strong>Temperature:</strong> {inspectionData.temperature ? `${inspectionData.temperature}°F` : "N/A"}</div>
            <div><strong>Weather:</strong> {inspectionData.weather || "N/A"}</div>
            <div><strong>Ground Condition:</strong> {inspectionData.ground_condition || "N/A"}</div>
            <div><strong>Mold Test Performed:</strong> {inspectionData.mold_test ? "Yes" : "No"}</div>
            <div><strong>Radon Test Performed:</strong> {inspectionData.radon_test ? "Yes" : "No"}</div>
            <div><strong>Rain in Last 3 Days:</strong> {inspectionData.rain_last_three_days ? "Yes" : "No"}</div>
          </div>
        </section>
      )}

      {sections.reduce((acc, section) => {
        const data = sectionData[section];
        const hasPhotos = data?.some(item => photosByItem[item.item_name || item.itemName]);
        if ((!data || data.length === 0) && !hasPhotos) return acc;
        acc.push({ section, data });
        return acc;
      }, []).map((sectionInfo, visibleIdx) => {
        const { section, data } = sectionInfo;
        return (
          <section key={section} className="report-section">
            <h2 className="section-header">{`${visibleIdx + 1}. ${sectionTitles[section]}`}</h2>
            {data.map((item, idx) => renderItem(item, `${visibleIdx + 1}.${idx + 1}`))}
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
