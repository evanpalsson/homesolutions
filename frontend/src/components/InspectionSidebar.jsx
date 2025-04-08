import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import '../styles/InspectionSidebar.css';

const InspectionSidebar = () => {
  const { inspectionId, propertyId } = useParams();

  const worksheets = [
    { name: 'HOME DETAILS', path: 'HomeDetails', },
    { name: '1. EXTERIOR', path: 'Exterior' },
    { name: '2. ROOF', path: 'Roof' },
    { name: '3. BASEMENT & FOUNDATION', path: 'BasementFoundation' },
    { name: '4. HEATING', path: 'Heating' },
    { name: '5. COOLING', path: 'Cooling' },
    { name: '6. PLUMBING', path: 'Plumbing' },
    { name: '7. ELECTRICAL', path: 'Electrical' },
    { name: '8. ATTIC', path: 'Attic' },
    { name: '9. DOORS & WINDOWS', path: 'DoorsWindows' },
    { name: '10. FIREPLACE', path: 'Fireplace' },
    { name: '11. OPTIONAL SYSTEMS & COMPONENTS', path: 'SystemsComponents' },
    { name: 'SUMMARY', path: 'Summary' },
  ];

  return (
    <div className="inspection-sidebar">
      <ul>
        {worksheets.map((worksheet) => (
          <li key={worksheet.path} className={`sidebar-item ${worksheet.path.toLowerCase()}`}>
            <NavLink
              to={`/inspection-form/${inspectionId}/${propertyId}/${worksheet.path}`}
              className="worksheet-link"
              activeClassName="active"
            >
              {worksheet.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InspectionSidebar;
