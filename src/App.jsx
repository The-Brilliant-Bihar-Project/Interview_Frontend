import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import AdminLogin from "./components/AdminLogin";
import MockInterviewBanner from "./components/MockInterviewBanner";
import MockAdminDashboard from "./components/MockAdminDashboard";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<MockAdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<MockInterviewBanner />} />

      </Routes>
    </Router>
  );
};

export default App;
