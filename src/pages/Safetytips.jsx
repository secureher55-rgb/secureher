import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Safetytips.scss';

const SafetyTips = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('personal');

  const safetyTips = {
    personal: [
      {
        title: "Be Aware of Your Surroundings",
        content: "Always stay alert and avoid distractions like your phone when walking in unfamiliar areas. Make mental notes of exits and safe places as you move through spaces.",
        icon: "fas fa-binoculars"
      },
      {
        title: "Trust Your Instincts",
        content: "If a situation feels wrong, it probably is. Don't worry about being polite - prioritize your safety and remove yourself from uncomfortable situations.",
        icon: "fas fa-heart"
      },
      {
        title: "Vary Your Routines",
        content: "Avoid predictable patterns. Change up your routes and schedules regularly to make it harder for someone to track your movements.",
        icon: "fas fa-route"
      },
      {
        title: "Keep Personal Information Private",
        content: "Be cautious about sharing personal details with strangers, including on social media. Avoid sharing your daily routines or locations in real-time.",
        icon: "fas fa-user-secret"
      }
    ],
    digital: [
      {
        title: "Use Strong, Unique Passwords",
        content: "Create complex passwords and use a password manager. Enable two-factor authentication on all important accounts.",
        icon: "fas fa-key"
      },
      {
        title: "Review Privacy Settings Regularly",
        content: "Check and adjust privacy settings on social media platforms. Limit what strangers can see about your profile and activities.",
        icon: "fas fa-shield-alt"
      },
      {
        title: "Be Wary of Location Sharing",
        content: "Think carefully before sharing your location publicly. Use location services only with trusted apps and people.",
        icon: "fas fa-map-marker-alt"
      },
      {
        title: "Recognize Phishing Attempts",
        content: "Be suspicious of unsolicited messages asking for personal information. Verify requests through alternative channels before responding.",
        icon: "fas fa-fish"
      }
    ],
    emergency: [
      {
        title: "Program Emergency Contacts",
        content: "Save emergency contacts in your phone with ICE (In Case of Emergency) prefix. Keep a list of important numbers in your wallet too.",
        icon: "fas fa-address-book"
      },
      {
        title: "Know Emergency Numbers",
        content: "Memorize local emergency numbers. In India: Police (112), Women Helpline (1090), Ambulance (108).",
        icon: "fas fa-phone-alt"
      },
      {
        title: "Have an Escape Plan",
        content: "Always identify exits in buildings and venues. Plan alternative routes home in case your usual path is blocked or unsafe.",
        icon: "fas fa-door-open"
      },
      {
        title: "Use Safety Apps",
        content: "Keep safety apps like SecureHer easily accessible. Familiarize yourself with their features before you need them.",
        icon: "fas fa-mobile-alt"
      }
    ],
    transportation: [
      {
        title: "Verify Rideshare Details",
        content: "Always check license plate, driver photo, and car model before entering a rideshare vehicle. Never get in a car that doesn't match the app details.",
        icon: "fas fa-car"
      },
      {
        title: "Share Trip Details",
        content: "Use app features to share your ride details with trusted contacts. Let someone know when you've arrived safely.",
        icon: "fas fa-share-alt"
      },
      {
        title: "Choose Well-Lit Stops",
        content: "When using public transport, get on and off at well-lit stops with people around. Avoid isolated stations, especially at night.",
        icon: "fas fa-lightbulb"
      },
      {
        title: "Sit Near the Driver",
        content: "On buses and trains, choose seats near the driver or conductor. In rideshares, sit in the back seat on the opposite side from the driver.",
        icon: "fas fa-chair"
      }
    ],
    home: [
      {
        title: "Secure Entry Points",
        content: "Ensure all doors and windows have working locks. Consider additional security measures like doorbell cameras or peepholes.",
        icon: "fas fa-lock"
      },
      {
        title: "Don't Advertise Absence",
        content: "Avoid announcing vacations on social media until after you return. Use timers for lights when away to create the appearance of occupancy.",
        icon: "fas fa-home"
      },
      {
        title: "Verify Before Opening",
        content: "Always verify the identity of service people or delivery personnel before opening the door. Use a chain lock when speaking to strangers at your door.",
        icon: "fas fa-door-closed"
      },
      {
        title: "Know Your Neighbors",
        content: "Build relationships with trusted neighbors who can help in emergencies. Consider joining or starting a neighborhood watch program.",
        icon: "fas fa-people-arrows"
      }
    ]
  };

  const categories = [
    { id: 'personal', name: 'Personal Safety', icon: 'fas fa-user' },
    { id: 'digital', name: 'Digital Safety', icon: 'fas fa-laptop' },
    { id: 'emergency', name: 'Emergency Prep', icon: 'fas fa-first-aid' },
    { id: 'transportation', name: 'Transportation', icon: 'fas fa-bus' },
    { id: 'home', name: 'Home Safety', icon: 'fas fa-home' }
  ];

  return (
    <div className="safety-tips-container">
      {/* Header Section */}
      <section className="safety-hero">
        <div className="hero-content">
          <h1>Safety Tips & Resources</h1>
          <p className="hero-subtitle">
            Knowledge is your first line of defense. Learn practical strategies to enhance your personal safety in various situations.
          </p>
        </div>
        <div className="hero-image">
          <i className="fas fa-shield-alt"></i>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="categories-section">
        <div className="categories-nav">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <i className={category.icon}></i>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Tips Display */}
      <section className="tips-section">
        <h2 className="section-title">{categories.find(c => c.id === activeCategory)?.name} Tips</h2>
        <div className="tips-grid">
          {safetyTips[activeCategory].map((tip, index) => (
            <div key={index} className="tip-card glassy-card">
              <div className="tip-icon">
                <i className={tip.icon}></i>
              </div>
              <h3>{tip.title}</h3>
              <p>{tip.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="emergency-section glassy-card">
        <h2>Emergency Contacts</h2>
        <p className="section-subtitle">Save these numbers in your phone and keep them handy</p>
        <div className="emergency-numbers">
          <div className="emergency-item">
            <div className="emergency-icon police">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="emergency-info">
              <h3>Police</h3>
              <p className="number">100</p>
            </div>
          </div>
          <div className="emergency-item">
            <div className="emergency-icon women">
              <i className="fas fa-female"></i>
            </div>
            <div className="emergency-info">
              <h3>Women's Helpline</h3>
              <p className="number">1091</p>
            </div>
          </div>
          <div className="emergency-item">
            <div className="emergency-icon ambulance">
              <i className="fas fa-ambulance"></i>
            </div>
            <div className="emergency-info">
              <h3>Ambulance</h3>
              <p className="number">108</p>
            </div>
          </div>
          <div className="emergency-item">
            <div className="emergency-icon fire">
              <i className="fas fa-fire-extinguisher"></i>
            </div>
            <div className="emergency-info">
              <h3>Fire Department</h3>
              <p className="number">101</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="action-section">
        <h2>Need Immediate Help?</h2>
        <div className="action-buttons">
          <button 
            className="action-btn emergency"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-bell"></i>
            Activate Emergency Alert
          </button>
          <button 
            className="action-btn resources"
            onClick={() => navigate('/resources')}
          >
            <i className="fas fa-book"></i>
            Safety Resources
          </button>
          <button 
            className="action-btn contacts"
            onClick={() => navigate('/contactselector')}
          >
            <i className="fas fa-address-book"></i>
            Manage Emergency Contacts
          </button>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="resources-section">
        <h2>Additional Safety Resources</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <i className="fas fa-download"></i>
            <h3>Safety Checklist</h3>
            <p>Download our printable safety checklist to ensure you're prepared for various situations.</p>
          </div>
          <div className="resource-card">
            <i className="fas fa-film"></i>
            <h3>Video Tutorials</h3>
            <p>Watch demonstrations of basic self-defense techniques and safety practices.</p>
          </div>
          <div className="resource-card">
            <i className="fas fa-book"></i>
            <h3>Safety Guide</h3>
            <p>Comprehensive guide covering situational awareness and prevention strategies.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SafetyTips;