import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HomeInspectionReport from '../pages/HomeInspectionReport';
import SignUpForm from '../pages/SignUpForm';
import InspectionForm from '../pages/InspectionForm';
import NewInspection from '../pages/NewInspection';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home-inspection-report" element={<HomeInspectionReport />} />
      <Route path="/sign-up-form" element={<SignUpForm />} />
      <Route path="/new-inspection" element={<NewInspection />} />

      {/* Dynamic route for inspection_worksheets */}
      <Route path="/inspection-form/:propertyId/:worksheetId" element={<InspectionForm />} />
    </Routes>
  );
};

export default AppRoutes;
