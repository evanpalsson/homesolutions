import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { handleLogout } from "../utils/logout";
import axios from "../utils/axios";
import "../styles/InspectorDashboard.css";

const InspectorDashboard = () => {
  const history = useHistory();
  const logout = handleLogout(history);
  const [inspectorName, setInspectorName] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentInspections, setRecentInspections] = useState([]);
  const inspectorId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`/inspector/${inspectorId}/dashboard`);
        const {
          inspector_name,
          active_inspections,
          completed_inspections,
          recent_inspections
        } = res.data;

        setInspectorName(inspector_name);
        setActiveCount(active_inspections);
        setCompletedCount(completed_inspections);
        setRecentInspections(recent_inspections);
      } catch (err) {
        console.error("Failed to load inspector dashboard:", err);
      }
    };

    fetchDashboardData();
  }, [inspectorId]);

  const handleCreateInspection = () => {
    history.push("/new-inspection");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {inspectorName}</h1>

      <section className="dashboard-section">
        <h2 className="section-title">Inspection Overview</h2>
        <div className="stat-card">Active Inspections: {activeCount}</div>
        <div className="stat-card">Completed Inspections: {completedCount}</div>
        <button className="primary-btn" onClick={handleCreateInspection}>
          + New Inspection
        </button>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Recent Inspections</h2>
        {recentInspections.length > 0 ? (
          <ul className="inspection-list">
            {recentInspections.map((report) => (
              <li key={report.inspection_id} className="inspection-item">
                {report.address} - {report.status} ({report.date})
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent inspections.</p>
        )}
      </section>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default InspectorDashboard;