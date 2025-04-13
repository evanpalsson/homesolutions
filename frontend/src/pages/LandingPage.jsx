import React from "react";
import { useHistory } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const history = useHistory();

  return (
    <div className="landing-container">
      <img
        src="/homebrella-logo.png"
        alt="Homebrella Logo"
        className="landing-logo"
      />
      <h1 className="landing-title">Welcome to Homebrella</h1>
      <p className="landing-subtitle">All your home’s vital info under one roof.</p>
      <button className="landing-button" onClick={() => history.push("/login")}>
        Login
      </button>
    </div>
  );
};

export default LandingPage;
