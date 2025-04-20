import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { InspectionCRUD } from "../components/InspectionCRUD";
import InspectionSections from "../components/InspectionSections";
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
      materials: ["Wood", "Concrete", "Brick", "Stone", "Composite", "Other (see comments)"],
      condition: ["Settled", "Water Damage", "Rotting Posts", "Cracked Flooring", "Loose Railings"],
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

  return (
    <div>
      <h1>1. EXTERIOR</h1>
      <InspectionSections
        items={items}
        formData={formData}
        photos={photos}
        fetchPhotos={fetchPhotos}
        handlers={{
          handleCheckboxChange,
          handleCommentChange,
          handleStatusChange,
          handleResize,
          handlePhotoUpload,
          handlePhotoRemove,
        }}
      />
    </div>
  );
};

export default Exterior;
