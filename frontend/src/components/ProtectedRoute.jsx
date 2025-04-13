import React from "react";
import { Route, Redirect } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token found. Redirecting to login.");
          return <Redirect to="/login" />;
        }

        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            console.log("Token expired. Logging out.");
            localStorage.clear();
            return <Redirect to="/login" />;
          }

          const userType = decoded.user_type;

          if (allowedRoles && !allowedRoles.includes(userType)) {
            console.log("Unauthorized user type:", userType);
            return <Redirect to="/" />;
          }

          return <Component {...props} />;
        } catch (error) {
          console.error("Invalid token. Logging out.", error);
          localStorage.clear();
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default ProtectedRoute;
