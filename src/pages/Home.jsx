/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ContactSelector from "../components/ContactSelector";
import EmergencyButton from "../components/EmergencyButton";
import { sendSOS } from "../utils/sendSOS";
import "../styles/home.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { app } from "../firebase/config";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState("idle");

  const db = getFirestore(app);
  const auth = getAuth(app);

  // ✅ Utility: remove undefined/null values before saving to Firestore
  const cleanData = (obj) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip undefined and null values
      if (value === undefined || value === null) continue;
      
      // Handle nested objects
      if (typeof value === 'object' && !(value instanceof Timestamp) && !Array.isArray(value)) {
        const cleanedNested = cleanData(value);
        // Only add if the nested object has properties
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } 
      // Handle arrays
      else if (Array.isArray(value)) {
        // Filter out undefined/null values from arrays
        const filteredArray = value.filter(item => item !== undefined && item !== null);
        if (filteredArray.length > 0) {
          cleaned[key] = filteredArray;
        }
      }
      // Handle primitive values
      else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // 🔹 Auth + Load User Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.uid);
        await loadUserContacts(currentUser.uid);
      } else {
        setUser(null);
        setUserName("");
        setContacts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Fetch User Profile
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || "User");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // 🔹 Fetch Contacts
  const loadUserContacts = async (userId) => {
    try {
      const contactsRef = collection(db, "users", userId, "contacts");
      const contactsSnapshot = await getDocs(contactsRef);
      const contactsList = contactsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // 🔹 Emergency SOS Handler
  const handleEmergencyCall = async (audioUrl, location) => {
    if (!user) {
      alert("⚠️ Please log in to use emergency features.");
      return;
    }
    if (selectedContacts.length === 0) {
      alert("⚠️ Please select at least one emergency contact first.");
      return;
    }

    setIsEmergencyMode(true);
    setEmergencyStatus("sending");

    try {
      // ✅ Build alert data safely
      let alertData = {
        userId: user.uid,
        timestamp: Timestamp.now(),
        contacts: selectedContacts.map((c) => c.id).filter(id => id), // Filter out undefined IDs
        status: "sent",
      };

      // Only add audioUrl if it exists
      if (audioUrl) {
        alertData.audioUrl = audioUrl;
      }

      // Only add location if it exists and has valid coordinates
      if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        alertData.location = {
          lat: location.lat,
          lng: location.lng
        };
      }

      // Remove null/undefined fields
      alertData = cleanData(alertData);

      console.log("Saving to Firestore:", alertData);

      // Save to Firestore
      const alertRef = await addDoc(
        collection(db, "emergencyAlerts"),
        alertData
      );

      await updateDoc(doc(db, "users", user.uid), {
        emergencyAlerts: arrayUnion(alertRef.id),
      });

      // ✅ Send SMS to each contact
      for (const contact of selectedContacts) {
        const phone = contact.phone;
        if (!phone) continue; // skip if no phone number

        const message = `🚨 Emergency Alert from ${
          userName || "a SecureHer user"
        }!\n📍 Location: ${
          location?.lat && location?.lng
            ? `https://maps.google.com/?q=${location.lat},${location.lng}`
            : "Location unavailable"
        }\n🎤 Audio: ${
          audioUrl || "No recording available"
        }\n⏰ Time: ${new Date().toLocaleString()}`;

        const res = await sendSOS(phone, message);
        if (!res.success) {
          console.error(`❌ Failed to send SOS to ${phone}:`, res.error);
        }
      }

      setEmergencyStatus("sent");

      setTimeout(() => {
        setIsEmergencyMode(false);
        setEmergencyStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      setEmergencyStatus("error");
    }
  };

  return (
    <div className="main-container">
      <div className="home-container">
        <main className="mobile-main glassy-card">
          {/* 🔹 Welcome Section */}
          <section className="welcome-section">
            <h1 className="app-title">
              Secure<span>Her</span>
            </h1>
            <p className="tagline">Your lifeline in emergencies</p>
            {user && (
              <p className="welcome-text">
                Welcome, <strong>{userName}</strong> 👋
              </p>
            )}
          </section>

          {/* 🔹 Main Content */}
          <section className="main-content">
            {!isEmergencyMode ? (
              user ? (
                <>
                  <p className="instruction">
                    Select contacts & stay protected
                  </p>
                  <ContactSelector
                    contacts={contacts}
                    selectedContacts={selectedContacts}
                    setSelectedContacts={setSelectedContacts}
                  />

                  {/* 🚨 Emergency Button */}
                  <EmergencyButton onEmergencyCall={handleEmergencyCall} />

                  {/* ℹ️ Quick Access */}
                  <div className="more-options">
                    <h3>Quick Access</h3>
                    <div className="options-list">
                      <button
                        className="option-btn emergency-call"
                        onClick={() => (window.location.href = "tel:112")}
                      >
                        <i className="fas fa-phone"></i> Emergency Call (112)
                      </button>

                      <button
                        className="option-btn"
                        onClick={() => navigate("/info")}
                      >
                        <i className="fas fa-info-circle"></i> How It Works
                      </button>
                      <button
                        className="option-btn"
                        onClick={() => navigate("/safety-tips")}
                      >
                        <i className="fas fa-shield-alt"></i> Safety Tips
                      </button>
                      <button
                        className="option-btn"
                        onClick={() => navigate("/helplines")}
                      >
                        <i className="fas fa-phone-alt"></i> Emergency Numbers
                      </button>
                      <button
                        className="option-btn"
                        onClick={() => navigate("/about")}
                      >
                        <i className="fas fa-users"></i> About SecureHer
                      </button>
                    </div>
                  </div>

                  {/* 🟢 Safety Tips */}
                  <div className="safety-tips glassy-card">
                    <h3>
                      <i className="fas fa-lightbulb"></i> Safety Tips
                    </h3>
                    <ul>
                      <li>Always share your live location with trusted contacts.</li>
                      <li>Keep your emergency contacts updated.</li>
                      <li>Stay in well-lit and public areas when possible.</li>
                      <li>Trust your instincts – leave unsafe situations quickly.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="login-prompt glassy-card">
                  <i className="fas fa-lock"></i>
                  <p>Please log in to access emergency features</p>
                  <button
                    className="login-btn-prompt"
                    onClick={() => navigate("/login")}
                  >
                    <i className="fas fa-sign-in-alt"></i> Login to Continue
                  </button>
                </div>
              )
            ) : (
              <div className="emergency-active">
                {emergencyStatus === "sending" && (
                  <div className="recording-indicator">
                    <div className="pulse-ring"></div>
                    <i className="fas fa-microphone glow"></i>
                    <span>Recording & Sending...</span>
                  </div>
                )}
                {emergencyStatus === "sent" && (
                  <div className="success-message glassy-card">
                    <i className="fas fa-check-circle"></i>
                    <h3>Emergency Alert Sent!</h3>
                  </div>
                )}
                {emergencyStatus === "error" && (
                  <div className="error-message glassy-card">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>Error Sending Alert</h3>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}