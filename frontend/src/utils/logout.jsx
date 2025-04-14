import axios from "./axios";

export const handleLogout = (history) => async () => {
  try {
    await axios.post("/logout", {}, { withCredentials: true });
  } catch (err) {
    console.error("Error logging out:", err);
  }
  localStorage.clear();
  history.push("/login");
};
