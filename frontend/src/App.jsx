import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// import Sidebar from "../src/components/Sidebar";
import AppRoutes from './routes/Routes';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div style={{ display: "flex" }}>
        
        <div style={{ marginLeft: "250px", padding: "20px", width: "100%" }}>
      <AppRoutes />
      </div>
      </div>
    </Router>
  );
}

export default App;
