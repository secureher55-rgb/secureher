import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/About.scss';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About SecureHer</h1>
          <p className="hero-subtitle">
            Your safety is our priority. SecureHer is designed to empower women with instant emergency assistance.
          </p>
        </div>
        <div className="hero-image">
          <i className="fas fa-shield-alt"></i>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section glassy-card">
        <h2>Our Mission</h2>
        <p>
          SecureHer was created to address the growing need for personal safety solutions for women. 
          Our mission is to provide a reliable, easy-to-use emergency response system that gives women 
          the confidence to navigate their daily lives without fear.
        </p>
        <div className="mission-stats">
          <div className="stat">
            <h3>24/7</h3>
            <p>Always Active</p>
          </div>
          <div className="stat">
            <h3>Instant</h3>
            <p>Emergency Response</p>
          </div>
          <div className="stat">
            <h3>Secure</h3>
            <p>Data Protection</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>How SecureHer Protects You</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>One-Tap Emergency Alert</h3>
            <p>
              Instantly send emergency alerts with your location to trusted contacts 
              with a single tap.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-microphone"></i>
            </div>
            <h3>Audio Recording</h3>
            <p>
              Automatically records audio during emergencies to provide context 
              to your emergency contacts.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>Live Location Sharing</h3>
            <p>
              Share your real-time location with emergency contacts during 
              critical situations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-address-book"></i>
            </div>
            <h3>Contact Management</h3>
            <p>
              Easily manage your emergency contacts and set priority levels 
              for different situations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h3>Secure Data</h3>
            <p>
              Your personal information and emergency data are encrypted 
              and stored securely.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-lightbulb"></i>
            </div>
            <h3>Safety Resources</h3>
            <p>
              Access safety tips, emergency numbers, and resources to help 
              you stay prepared.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section glassy-card">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Set Up Your Profile</h3>
              <p>Add your information and emergency contacts to your secure profile.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Customize Your Settings</h3>
              <p>Choose your preferred emergency response settings and contact priorities.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Stay Protected</h3>
              <p>Go about your day knowing SecureHer is ready to help at a moment's notice.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Emergency Response</h3>
              <p>In case of emergency, tap the alert button to notify your contacts with your location and audio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to Feel Secure?</h2>
        <p>Join thousands of women who trust SecureHer for their personal safety</p>
        <div className="cta-buttons">
          <button 
            className="cta-btn primary"
            onClick={() => navigate('/')}
          >
            Get Started
          </button>
          <button 
            className="cta-btn secondary"
            onClick={() => navigate('/safety-tips')}
          >
            Safety Tips
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3>Is SecureHer free to use?</h3>
            <p>
              Yes, SecureHer is completely free to use. Our mission is to make safety 
              accessible to all women.
            </p>
          </div>
          <div className="faq-item">
            <h3>How does the emergency alert work?</h3>
            <p>
              When you activate the emergency alert, SecureHer immediately sends your 
              location and a short audio recording to your selected emergency contacts.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is my data secure?</h3>
            <p>
              Absolutely. We use industry-standard encryption and security practices 
              to protect your personal information.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I use SecureHer internationally?</h3>
            <p>
              Yes, SecureHer works anywhere you have an internet connection. However, 
              emergency services integration may vary by country.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;