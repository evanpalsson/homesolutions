import React, { useState } from "react";
import '../styles/SignUpForm.css';

function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage("Sign-up successful!");
        setErrorMessage("");
      } else {
        const { message } = await response.json();
        setErrorMessage(message || "Sign-up failed.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    window.location.href = "/auth/google";
  };

  // Apple Sign-In handler
  const handleAppleSignIn = async () => {
    window.location.href = "/auth/apple";
  };

  return (
    <div className="signup-form-container">
      <h1>Sign Up</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">Sign Up</button>
      </form>

      <div className="auth-buttons">
        <button onClick={handleGoogleSignIn} className="google-button">
          Sign in with Google
        </button>
        <button onClick={handleAppleSignIn} className="apple-button">
          Sign in with Apple
        </button>
      </div>
    </div>
  );
}

export default SignUpForm;
