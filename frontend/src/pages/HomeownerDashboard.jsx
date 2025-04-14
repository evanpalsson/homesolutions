import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import "../styles/HomeownerDashboard.css";
import { useHistory } from "react-router-dom";
import { handleLogout } from "../utils/logout";

const HomeownerDashboard = () => {
  const history = useHistory();
  const logout = handleLogout(history);

  const [userData, setUserData] = useState(null);
  // eslint-disable-next-line
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError("No user ID found. Please log in again.");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`/homeowner/${userId}/dashboard`);
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard. Please try again.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
        {!userData ? (
        <p>Loading dashboard...</p>
        ) : (
        <>
            <h1 className="dashboard-title">Welcome, {userData.name}</h1>

            {/* Home Health Score */}
            <section className="dashboard-section">
            <h2 className="section-title">Home Health</h2>
            <div className="health-card">
                <p className="health-score">Score: {userData.health_score || 82}</p>
                <p className="health-description">{userData.health_summary || "Overall your home is in good condition."}</p>
            </div>
            </section>

            {/* Insurance & Mortgage */}
            <section className="dashboard-section two-column">
            <div className="info-card">
                <h3>Insurance</h3>
                <p>Provider: {userData.insurance_provider || "StateFarm"}</p>
                <p>Policy #: {userData.insurance_policy || "SF-203983"}</p>
            </div>
            <div className="info-card">
                <h3>Mortgage</h3>
                <p>Lender: {userData.mortgage_lender || "Wells Fargo"}</p>
                <p>Remaining Balance: ${userData.mortgage_balance || "243,000"}</p>
            </div>
            </section>

            {/* Maintenance Projects */}
            <section className="dashboard-section">
            <h2 className="section-title">Projects</h2>
            {(userData.projects || []).map((proj, idx) => (
                <div className="project-card" key={idx}>
                <p><strong>{proj.name}</strong> – Scheduled for {proj.date}</p>
                <p>Status: <span className={`project-status ${proj.status.toLowerCase()}`}>{proj.status}</span></p>
                </div>
            ))}
            </section>

            {/* Inspection History */}
            <section className="dashboard-section">
            <h2 className="section-title">Inspection History</h2>
            <ul className="inspection-list">
                {(userData.inspections || []).map((insp, idx) => (
                <li key={idx}>{insp.date} – {insp.summary}</li>
                ))}
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
            {(userData.service_providers || []).map((provider, idx) => (
                <div className="service-provider-card" key={idx}>
                <p><strong>{provider.name}</strong></p>
                <p>{provider.phone}</p>
                </div>
            ))}
            </section>

            <button onClick={logout}>Logout</button>
        </>
        )}
    </div>
  );
};

export default HomeownerDashboard;
