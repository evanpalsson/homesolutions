import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomeInspectionReport from '../pages/HomeInspectionReport';
import SignUpForm from '../pages/SignUpForm';
import InspectionForm from '../pages/InspectionForm';
import NewInspection from '../pages/NewInspection';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from "../components/ProtectedRoute";
import InspectorDashboard from "../pages/InspectorDashboard";
import HomeownerDashboard from "../pages/HomeownerDashboard";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
  return (
    <Switch>
      <Route exact path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/inspector" component={InspectorDashboard} allowedRoles={["inspector"]} />
      <ProtectedRoute path="/dashboard" component={HomeownerDashboard} allowedRoles={["homeowner"]} />
      <ProtectedRoute path="/admin" component={AdminDashboard} allowedRoles={["admin"]} />
      <Route
        path="/:inspectionId/:propertyId/home-inspection-report"
        component={HomeInspectionReport}
      />
      <Route path="/sign-up-form" component={SignUpForm} />
      <Route path="/new-inspection" component={NewInspection} />
      <Route
        path="/inspection-form/:inspectionId/:propertyId/:worksheetId"
        component={InspectionForm}
      />
    </Switch>
  );
};

export default AppRoutes;
