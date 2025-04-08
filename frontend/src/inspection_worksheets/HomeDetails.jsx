import React, { memo } from 'react';
import PropertyDetails from "../components/PropertyDetails";
import InspectionDetails from '../components/InspectionDetails';
import '../styles/HomeDetails.css';

function HomeDetails() {
  return (
    <section className="home-details-section">
      <h1 className="section-title">HOME DETAILS</h1>
      <div className="details-box">
        <div className="column">
          <PropertyDetails />
        </div>
        <div className="column">
          <InspectionDetails />
        </div>
      </div>
    </section>
  );
}

export default memo(HomeDetails);
