import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../styles/LoginPage.css";
import axios from "../utils/axios";

const LoginPage = () => {
  const history = useHistory();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
  
    try {
      const res = await axios.post("http://localhost:8080/api/login", {
        email: form.email,
        password: form.password,
      });
  
      const { token, role } = res.data;
  
      // Store token locally
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
  
      // Redirect user to the appropriate dashboard
      if (userType === "admin") history.push("/admin");
      else if (userType === "inspector") history.push("/inspector");
      else history.push("/dashboard");
  
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <img src="/homebrella-logo.png" alt="Homebrella" className="login-logo" />
      <h2 className="login-title">Login to Homebrella</h2>

      <form className="login-form" onSubmit={handleLogin}>
        {error && <p className="login-error">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="login-input"
        />
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
