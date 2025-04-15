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
        const response = await axios.post("/login", {
            email: form.email,
            password: form.password,
          });          
      
        const { token, user_type, user_id } = response.data;
      
        localStorage.setItem("token", token);
        localStorage.setItem("user_type", user_type);
        localStorage.setItem("user_id", user_id);
      
        console.log("Login successful, user_type:", user_type);
      
        if (user_type === "admin") {
            history.push("/admin/dashboard");
          } else if (user_type === "inspector") {
            history.push("/inspector/dashboard"); // ✅ Make sure this matches your route path
          } else if (user_type === "homeowner") {
            history.push("/dashboard");
          } else {
            history.push("/");
          }
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
        <p className="signup-link">
          Don't have an account?{" "}
          <span onClick={() => history.push("/sign-up-form")} className="signup-clickable">
            Sign up here
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
