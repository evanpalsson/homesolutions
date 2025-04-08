import React from 'react';
import { Switch, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HomeInspectionReport from '../pages/HomeInspectionReport';
import SignUpForm from '../pages/SignUpForm';
import InspectionForm from '../pages/InspectionForm';
import NewInspection from '../pages/NewInspection';

const AppRoutes = () => {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
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
