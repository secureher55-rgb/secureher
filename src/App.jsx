import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
// import Contacts from "./pages/Contacts";     // ✅ Added
// import Profile from "./pages/Profile";       // ✅ Added
// import AlertConfirm from "./pages/AlertConfirm"; // ✅ Added
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header /> {/* ✅ Fixed Header */}

        {/* ✅ Add padding so content is below header */}
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/contacts" element={<Contacts />} />   ✅ New route */}
            {/* <Route path="/profile" element={<Profile />} />     ✅ New route */}
            {/* <Route path="/alert-confirm" element={<AlertConfirm />} /> ✅ New route */}
            <Route path="/info" element={<div>How It Works</div>} />
            <Route path="/safety-tips" element={<div>Safety Tips</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
