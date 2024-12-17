import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HomeInspectionReport from '../pages/HomeInspectionReport';
import SignUpForm from '../pages/SignUpForm';
import InspectionForm from '../pages/InspectionForm';
import AddressValidation from '../pages/AddressValidation';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home-inspection-report" element={<HomeInspectionReport />} />
      <Route path="/sign-up-form" element={<SignUpForm />} />
      <Route path="/inspection-form" element={<InspectionForm />} />
      <Route path="/address-validation" element={<AddressValidation />} />
    </Routes>
  );
};

export default AppRoutes;
