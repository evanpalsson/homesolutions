// src/utils/axios.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Ensures cookies like refresh token are sent
});

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        // Attempt token refresh
        const res = await axios.post(
          "http://localhost:8080/api/refresh-token",
          {},
          { withCredentials: true }
        );

        token = res.data.token;
        localStorage.setItem("token", token);
      }

      config.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Token expired or invalid. Logging out.");
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return config;
});

export default api;
