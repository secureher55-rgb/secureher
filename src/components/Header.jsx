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

  // 🔹 Handle auth + scroll
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const handleScroll = () => setScrolled(window.scrollY > 10);
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
          {/* 🔹 Logo + Title */}
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

          {/* 🔹 Desktop Navigation */}
          <nav className="desktop-nav">
            {user ? (
              <>
                <button
                  className={`nav-item ${isActiveRoute("/about") ? "active" : ""}`}
                  onClick={() => navigate("/about")}
                >
                  <i className="fas fa-address-card"></i>
                  <span>About</span>
                </button>

                <button
                  className={`nav-item ${isActiveRoute("/contactselector") ? "active" : ""}`}
                  onClick={() => navigate("/contactselector")}
                >
                  <i className="fas fa-address-book"></i>
                  <span>Contacts</span>
                </button>

                {/* 🔹 Chat Link */}
                <button
                  className={`nav-item ${isActiveRoute("/chat") ? "active" : ""}`}
                  onClick={() => navigate("/chat")}
                >
                  <i className="fas fa-comments"></i>
                  <span>Chat</span>
                </button>

                <button
                  className={`nav-item ${isActiveRoute("/safety-tips") ? "active" : ""}`}
                  onClick={() => navigate("/safety-tips")}
                >
                  <i className="fas fa-lightbulb"></i>
                  <span>Safety Tips</span>
                </button>
              </>
            ) : (
              <button className="nav-item login-btn" onClick={() => navigate("/login")}>
                <i className="fas fa-user"></i>
                <span>Login</span>
              </button>
            )}

            {/* Always show Profile */}
            <button
              className={`nav-item ${isActiveRoute("/profile") ? "active" : ""}`}
              onClick={() => navigate("/profile")}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
          </nav>

          {/* 🔹 Mobile Menu Toggle */}
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

        {/* 🔹 Mobile Navigation */}
        <nav className={`mobile-nav ${isMenuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <button
                className={`nav-item ${isActiveRoute("/profile") ? "active" : ""}`}
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </button>

              <button
                className={`nav-item ${isActiveRoute("/contactselector") ? "active" : ""}`}
                onClick={() => {
                  navigate("/contactselector");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-address-book"></i>
                <span>Manage Contacts</span>
              </button>

              {/* 🔹 Chat Link (Mobile) */}
              <button
                className={`nav-item ${isActiveRoute("/chat") ? "active" : ""}`}
                onClick={() => {
                  navigate("/chat");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-comments"></i>
                <span>Chat</span>
              </button>

              <button
                className={`nav-item ${isActiveRoute("/safety-tips") ? "active" : ""}`}
                onClick={() => {
                  navigate("/safety-tips");
                  setIsMenuOpen(false);
                }}
              >
                <i className="fas fa-lightbulb"></i>
                <span>Safety Tips</span>
              </button>
            </>
          ) : (
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
