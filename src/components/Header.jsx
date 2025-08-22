import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config"; // ✅ make sure this path is correct
import "../styles/header.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen to user state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="main-header">
    <header className="mobile-header">
      <div className="header-content">
        {/* Logo + Title */}
        <div className="logo-container flex items-center">
          <div className="app-logo text-red-500 text-2xl mr-2">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="app-title font-bold text-lg">SecureHer</h1>
        </div>

        {/* Three-dot button */}
        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          <button
            className="nav-item"
            onClick={() => {
              navigate("/info");
              setIsMenuOpen(false);
            }}
          >
            <i className="fas fa-info-circle mr-2"></i>
            How It Works
          </button>

          <button
            className="nav-item"
            onClick={() => {
              navigate("/safety-tips");
              setIsMenuOpen(false);
            }}
          >
            <i className="fas fa-lightbulb mr-2"></i>
            Safety Tips
          </button>

          {user ? (
            <button
              className="nav-item text-red-500"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          ) : (
            <button
              className="nav-item"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              <i className="fas fa-user mr-2"></i>
              Login / Sign Up
            </button>
          )}
        </nav>
      )}
    </header>
    </div>
  );
}
