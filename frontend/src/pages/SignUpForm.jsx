import React, { useEffect, useState } from "react";
import "../styles/SignUpForm.css";
import { useLocation } from "react-router-dom";

function SignUpForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const invitedRole = queryParams.get("role");
  const inviteToken = queryParams.get("invite");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    user_type: invitedRole === "inspector" ? "inspector" : "homeowner",
  });

  const [inviteValid, setInviteValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateInvite = async () => {
      if (invitedRole === "inspector") {
        try {
          const res = await fetch(`/api/validate-invite?token=${inviteToken}`);
          const data = await res.json();

          if (res.ok) {
            setFormData((prev) => ({
              ...prev,
              email: data.email,
              user_type: data.user_type,
            }));
            setInviteValid(true);
          } else {
            setInviteValid(false);
          }
        } catch (error) {
          setInviteValid(false);
        }
      }
    };
    validateInvite();
  }, [invitedRole, inviteToken]);

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validatePassword(formData.password)) {
      setErrorMessage("Password must be at least 8 characters long and contain a letter and number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          invite: inviteToken || null,
        }),        
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Sign-up failed.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user_type", result.user_type);
      localStorage.setItem("user_id", result.user_id);

      setSuccessMessage("Sign-up successful! Redirecting...");
      setTimeout(() => {
        if (result.user_type === "homeowner") {
          window.location.href = "/dashboard";
        } else if (result.user_type === "inspector") {
          window.location.href = "/inspector/dashboard";
        }
      }, 1500);

    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (invitedRole === "inspector" && !inviteValid) {
    return (
      <div className="signup-form-container">
        <h1>Invalid Invitation</h1>
        <p>This inspector invitation link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <div className="signup-form-container">
      <h1>Sign Up</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={invitedRole === "inspector"} // lock email if inspector
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Hidden field to enforce role */}
        <input type="hidden" name="user_type" value={formData.user_type} />

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
