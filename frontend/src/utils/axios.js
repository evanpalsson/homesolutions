// src/utils/axios.js
import axios from "axios";
import jwtDecode from "jwt-decode";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // needed to send refresh cookie
});

instance.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  if (token) {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      try {
        const res = await axios.post("http://localhost:8080/api/refresh-token", {}, { withCredentials: true });
        token = res.data.token;
        localStorage.setItem("token", token);
      } catch (err) {
        console.error("Session expired");
        localStorage.clear();
        window.location.href = "/login";
        return config;
      }
    }

    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default instance;
