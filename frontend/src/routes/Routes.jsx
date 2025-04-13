import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomeInspectionReport from '../pages/HomeInspectionReport';
import SignUpForm from '../pages/SignUpForm';
import InspectionForm from '../pages/InspectionForm';
import NewInspection from '../pages/NewInspection';
import LoginPage from '../pages/LoginPage';

const AppRoutes = () => {
  return (
    <Switch>
      <Route exact path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
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
