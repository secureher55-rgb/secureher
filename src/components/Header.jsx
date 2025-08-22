import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import "../styles/header.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Listen to user state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <div className="main-header">
      <header className={`mobile-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-content">
          {/* Logo + Title */}
          <button
            className="logo-container"
            onClick={() => navigate("/")}
            aria-label="Go to homepage"
          >
            <div className="app-logo">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1 className="app-title">SecureHer</h1>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {/* ✅ Only show these when logged in */}
            {user && (
              <>
                <button
                  className={`nav-item ${
                    isActiveRoute("/profile") ? "active" : ""
                  }`}
                  onClick={() => navigate("/profile")}
                >
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </button>

                <button
                  className={`nav-item ${
                    isActiveRoute("/contactselector") ? "active" : ""
                  }`}
                  onClick={() => navigate("/contactselector")}
                >
                  <i className="fas fa-address-book"></i>
                  <span>Contacts</span>
                </button>

                <button
                  className={`nav-item ${
                    isActiveRoute("/safety-tips") ? "active" : ""
                  }`}
                  onClick={() => navigate("/safety-tips")}
                >
                  <i className="fas fa-lightbulb"></i>
                  <span>Safety Tips</span>
                </button>
              </>
            )}

            {/* ✅ Show Login only when logged out */}
            {!user && (
              <button
                className="nav-item login-btn"
                onClick={() => navigate("/login")}
              >
                <i className="fas fa-user"></i>
                <span>Login</span>
              </button>
            )}
          </nav>

          {/* Mobile menu toggle button */}
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`menu-icon ${isMenuOpen ? "open" : ""}`}>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <nav className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
          {/* ✅ Only show these when logged in */}
          {user && (
            <>
              <button
                className={`nav-item ${
                  isActiveRoute("/profile") ? "active" : ""
                }`}
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </button>

              <button
                className={`nav-item ${
                  isActiveRoute("/contactselector") ? "active" : ""
                }`}
                onClick={() => {
                  navigate("/contactselector");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-address-book"></i>
                <span>Manage Contacts</span>
              </button>

              <button
                className={`nav-item ${
                  isActiveRoute("/safety-tips") ? "active" : ""
                }`}
                onClick={() => {
                  navigate("/safety-tips");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-lightbulb"></i>
                <span>Safety Tips</span>
              </button>
            </>
          )}

          {/* ✅ Show Login only when logged out */}
          {!user && (
            <button
              className="nav-item login-btn"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              <i className="fas fa-user"></i>
              <span>Login / Sign Up</span>
            </button>
          )}
        </nav>
      </header>
    </div>
  );
}
