import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import '../styles/InspectionSidebar.css'; // Assuming there is a CSS file for styling

const InspectionSidebar = () => {
  const { inspectionId, propertyId } = useParams();

  const worksheets = [
    { name: 'Cover Page', path: 'CoverPage' },
    { name: 'Summary', path: 'Summary' },
    { name: 'Electromechanicals', path: 'Electromechanicals' },
    { name: 'Blank Room', path: 'BlankRoom' },
    { name: 'Basement', path: 'Basement' },
    { name: 'Attic', path: 'Attic' },
    { name: 'Swimming Pool', path: 'SwimmingPool' },
    { name: 'Exterior', path: 'Exterior' },
  ];

  return (
    <div className="inspection-sidebar">
      <ul>
        {worksheets.map((worksheet) => (
          <li key={worksheet.path}>
            <NavLink
              to={`/inspection-form/${inspectionId}/${propertyId}/${worksheet.path}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
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
