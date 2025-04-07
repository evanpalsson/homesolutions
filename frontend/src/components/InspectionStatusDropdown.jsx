import React from "react";

const InspectionStatusDropdown = ({ value, onChange }) => {
  return (
    <div className="item-list">
      <label><strong>Status:</strong></label>
      <select
        value={value || "Not Inspected"}
        onChange={(e) => onChange(e.target.value)}
        className="status-dropdown"
      >
        <option value="Inspected">Inspected</option>
        <option value="Not Inspected">Not Inspected</option>
        <option value="Not Present">Not Present</option>
        <option value="Repair or Replace">Repair or Replace</option>
      </select>
    </div>
  );
};

export default InspectionStatusDropdown;
