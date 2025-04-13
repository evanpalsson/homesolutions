import React from "react";
import "./../../styles/HomeownerDashboard.css";

const HomeownerDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome to Your Home Dashboard</h1>

      {/* Home Health Score */}
      <section className="dashboard-section">
        <h2 className="section-title">Home Health</h2>
        <div className="health-card">
          <p className="health-score">Score: 82</p>
          <p className="health-description">Overall your home is in good condition. A few minor repairs needed.</p>
        </div>
      </section>

      {/* Insurance & Mortgage */}
      <section className="dashboard-section two-column">
        <div className="info-card">
          <h3>Insurance</h3>
          <p>Provider: StateFarm</p>
          <p>Policy #: SF-203983</p>
        </div>
        <div className="info-card">
          <h3>Mortgage</h3>
          <p>Lender: Wells Fargo</p>
          <p>Remaining Balance: $243,000</p>
        </div>
      </section>

      {/* Maintenance Projects */}
      <section className="dashboard-section">
        <h2 className="section-title">Projects</h2>
        <div className="project-card">
          <p><strong>Gutter Repair</strong> – Scheduled for April 22</p>
          <p>Status: <span className="project-status in-progress">In Progress</span></p>
        </div>
      </section>

      {/* Inspection History */}
      <section className="dashboard-section">
        <h2 className="section-title">Inspection History</h2>
        <ul className="inspection-list">
          <li>🏠 March 2024 – View Report</li>
          <li>🏠 July 2023 – View Report</li>
        </ul>
      </section>

      {/* Documents */}
      <section className="dashboard-section">
        <h2 className="section-title">Documents</h2>
        <div className="docs-placeholder">Upload and view important home documents here.</div>
      </section>

      {/* Service Providers */}
      <section className="dashboard-section">
        <h2 className="section-title">Service Providers</h2>
        <div className="service-provider-card">
          <p><strong>Plumbing Co.</strong></p>
          <p>📞 (210) 555-0101</p>
        </div>
      </section>
    </div>
  );
};

export default HomeownerDashboard;
