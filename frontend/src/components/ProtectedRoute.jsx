import React from "react";
import { Route, Redirect } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem("token");

        if (!token) {
          return <Redirect to="/login" />;
        }

        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            localStorage.clear();
            return <Redirect to="/login" />;
          }

          if (allowedRoles && !allowedRoles.includes(decoded.user_type)) {
            return <Redirect to="/login" />;
          }

          return <Component {...props} />;
        } catch (error) {
          localStorage.clear();
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default ProtectedRoute;
