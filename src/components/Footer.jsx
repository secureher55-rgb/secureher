import React from "react";
import "../styles/footer.scss";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className="mobile-footer">
      <div className="footer-info">
        <p>Powered by Women Empowerment </p>
        <p>@SecureHer</p>
      </div>

      <div className="footer-links">
        <span onClick={() => handleNavigation("/terms")}>Terms & Conditions</span>
        <span onClick={() => handleNavigation("/privacy")}>Privacy Policy</span>
        <span onClick={() => handleNavigation("/contact")}>Contact Us</span>
      </div>

      <div className="footer-copy">
        <p>&copy; {new Date().getFullYear()} SecureHer. All rights reserved.</p>
      </div>
    </footer>
  );
}
