import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ✅ Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ManageContacts = lazy(() => import("./pages/ManageContacts"));
const Chat = lazy(() => import("./pages/Chat"));
const About = lazy(() => import("./pages/About"));
const Safetytips = lazy(() => import("./pages/Safetytips")); // 🔹 NEW

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* ✅ Fixed Header */}
        <Header />

        {/* ✅ Content below header */}
        <main className="flex-1 pt-16 px-4">
          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contactselector" element={<ManageContacts />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/about" element={<About />} />
              <Route path="/safety-tips" element={<Safetytips />} /> {/* ✅ Updated */}
              <Route path="/info" element={<div>📖 How It Works</div>} />
              <Route
                path="*"
                element={<div className="text-center py-10">404 | Page Not Found</div>}
              />
            </Routes>
          </Suspense>
        </main>

        {/* ✅ Footer at bottom */}
        <Footer />
      </div>
    </Router>
  );
}
