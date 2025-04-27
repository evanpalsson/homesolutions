import React, { useState, useEffect, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "../utils/axios";
import sectionDescriptions from "../constants/sectionDescriptions";
import "../styles/HomeInspectionReport.css";

const HomeInspectionReport = () => {
  const { propertyId, inspectionId } = useParams();
  const history = useHistory();
  const [propertyData, setPropertyData] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [photosByItem, setPhotosByItem] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [propertyPhotoUrl, setPropertyPhotoUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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

  const buildInspectionReportText = () => {
    const visibleSections = Object.keys(sectionData).filter(sectionKey => {
      const items = sectionData[sectionKey];
      const hasItems = items && items.length > 0;
      const hasPhotos = items?.some(item => photosByItem[item.item_name || item.itemName]);
      return hasItems || hasPhotos;
    });
  
    let reportText = "";
    visibleSections.forEach((sectionKey, idx) => {
      const sectionTitle = sectionTitles[sectionKey] || sectionKey;
      reportText += `${idx + 1}. ${sectionTitle}\n`;
  
      sectionData[sectionKey].forEach(item => {
        if (!item.inspection_status || item.inspection_status === "Not Inspected") return;
  
        const itemName = item.item_name || item.itemName;
        const status = item.inspection_status;
        const conditions = item.conditions
          ? Object.keys(item.conditions).filter(c => item.conditions[c]).join(", ")
          : "";
  
        reportText += `- ${itemName} (${status}${conditions ? " - " + conditions : ""})\n`;
  
        if (item.comments?.trim()) {
          reportText += `  Observation: ${item.comments.trim()}\n`;
        }
      });
  
      reportText += "\n";
    });
  
    return reportText;
  };
  
  const runAnalysis = async () => {
    const reportText = buildInspectionReportText();
  
    try {
      setAnalyzing(true);
      const payload = {
        inspection_id: inspectionId,
        property_id: propertyId,
        text: reportText,
        photoDescriptions: ""
      };      
  
      console.log("📤 Submitting analysis payload:", payload);
  
      await axios.post("/analyze", payload);
  
      history.push({
        pathname: `/inspection-analysis/${inspectionId}`,
        state: { propertyId }
      });
    } catch (err) {
      console.error("❌ Analysis request failed:", err);
      alert("Failed to analyze the report.");
    } finally {
      setAnalyzing(false);
    }
  };  

  const renderItem = (item, indexPrefix) => {
    const itemName = item.item_name || item.itemName;
    const materialList = item.materials
      ? Object.entries(item.materials)
          .filter(([key, value]) => value)
          .map(([key, value]) => `${key} (${value})`)
          .join(", ")
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
              <strong>Type or Material (Condition): </strong> {materialList}
            </div>
          )}
        </div>
  
        {item.comments?.trim() && (
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
      {/* Top-right Analyze button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          className="analyze-report-button"
          onClick={runAnalysis}
          disabled={analyzing}
          style={{
            padding: "8px 16px",
            backgroundColor: "#C9302C",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          {analyzing ? "Analyzing..." : "Analyze Report"}
        </button>
      </div>

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
      {sections.reduce((acc, section) => {
        const data = sectionData[section];
        const hasPhotos = data?.some(item => item && photosByItem[item.item_name || item.itemName]);
        if ((!data || data.length === 0) && !hasPhotos) return acc;
        acc.push({ section, data });
        return acc;
      }, []).map((sectionInfo, visibleIdx) => {
        const { section, data } = sectionInfo;
        return (
          <section key={section} className="report-section">
            <h2 className="section-header">{`${visibleIdx + 1}. ${sectionTitles[section]}`}</h2>

            {sectionDescriptions[section] && (
              <div
                className="section-description"
                dangerouslySetInnerHTML={{ __html: sectionDescriptions[section] }}
              />
            )}

            {data.filter(Boolean).map((item, idx) => renderItem(item, `${visibleIdx + 1}.${idx + 1}`))}
          </section>
        );
      })}
    </div>
  );
};

export default HomeInspectionReport;
