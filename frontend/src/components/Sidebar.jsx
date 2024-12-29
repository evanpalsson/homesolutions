import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css"; // Ensure you create this file for styling

const Sidebar = () => {
    return (
      <div className="sidebar">
        <h2>Sidebar Menu</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => (isActive ? "active" : "")}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    );
  };
  
  export default Sidebar;
