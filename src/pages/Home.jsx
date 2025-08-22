/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getFirestore, collection, getDocs, addDoc, 
  doc, getDoc, updateDoc, arrayUnion, Timestamp 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ContactSelector from "../components/ContactSelector";
import "../styles/home.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { app } from "../firebase/config";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [emergencyStatus, setEmergencyStatus] = useState("idle");
  const recordingTimerRef = useRef(null);

  // 🔹 Auth + User Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserProfile(user.uid);
        await loadUserContacts(user.uid);
      } else {
        setUser(null);
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

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

  const loadUserContacts = async (userId) => {
    try {
      const contactsRef = collection(db, "users", userId, "emergencyContacts");
      const contactsSnapshot = await getDocs(contactsRef);
      const contactsList = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsList);
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // 🔹 Emergency Call (SOS logic with recording)
  const handleEmergencyCall = async () => {
    if (!user) {
      alert("Please log in to use emergency features.");
      return;
    }
    if (selectedContacts.length === 0) {
      alert("Please select at least one emergency contact first");
      return;
    }

    setIsEmergencyMode(true);
    setEmergencyStatus("sending");

    try {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            clearInterval(recordingTimerRef.current);
            stopRecordingAndSendAlert();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting emergency alert:", error);
      setEmergencyStatus("error");
    }
  };

  const stopRecordingAndSendAlert = async () => {
    try {
      const audioBlob = new Blob([new ArrayBuffer(0)], { type: "audio/webm" });
      const audioRef = ref(storage, `emergency-recordings/${user.uid}/${Date.now()}.webm`);
      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);

      const alertData = {
        userId: user.uid,
        timestamp: Timestamp.now(),
        contacts: selectedContacts,
        audioUrl,
        location: await getCurrentLocation(),
        status: "sent",
      };

      const alertRef = await addDoc(collection(db, "emergencyAlerts"), alertData);
      await updateDoc(doc(db, "users", user.uid), {
        emergencyAlerts: arrayUnion(alertRef.id),
      });

      setEmergencyStatus("sent");

      setTimeout(() => {
        setIsEmergencyMode(false);
        setEmergencyStatus("idle");
        setRecordingTime(0);
      }, 5000);
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      setEmergencyStatus("error");
    }
  };

  const getCurrentLocation = () =>
    new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve(null)
        );
      } else resolve(null);
    });

  const cancelEmergency = () => {
    clearInterval(recordingTimerRef.current);
    setIsEmergencyMode(false);
    setEmergencyStatus("idle");
    setRecordingTime(0);
  };

  return (
    <div className="main-container">
      <div className="home-container">
        <main className="mobile-main glassy-card">
          {/* 🔹 Welcome */}
          <section className="welcome-section">
            <h1 className="app-title">Secure<span>Her</span></h1>
            <p className="tagline">Your lifeline in emergencies</p>
            {user && <p className="welcome-text">Welcome, <strong>{userName}</strong> 👋</p>}
          </section>

          {/* 🔹 Main */}
          <section className="main-content">
            {!isEmergencyMode ? (
              <>
                {user ? (
                  <>
                    <p className="instruction">Select contacts & stay protected</p>
                    <ContactSelector 
                      contacts={contacts}
                      selectedContacts={selectedContacts}
                      setSelectedContacts={setSelectedContacts}
                    />

                    {/* ℹ️ Quick Access */}
                    <div className="more-options">
                      <h3>Quick Access</h3>
                      <div className="options-list">
                        {/* 🚨 Emergency Alert Button (Bell) */}
                        <button
                          className="option-btn emergency-bell"
                          onClick={handleEmergencyCall}
                        >
                          <i className="fas fa-bell"></i> Emergency Alert
                        </button>

                        {/* 🚨 Emergency Call (112) */}
                        <button
                          className="option-btn emergency-call"
                          onClick={() => window.location.href = "tel:112"}
                        >
                          <i className="fas fa-phone"></i> Emergency Call (112)
                        </button>

                        <button className="option-btn" onClick={() => navigate("/info")}>
                          <i className="fas fa-info-circle"></i> How It Works
                        </button>
                        <button className="option-btn" onClick={() => navigate("/safety-tips")}>
                          <i className="fas fa-shield-alt"></i> Safety Tips
                        </button>
                        <button className="option-btn" onClick={() => navigate("/helplines")}>
                          <i className="fas fa-phone-alt"></i> Emergency Numbers
                        </button>
                        <button className="option-btn" onClick={() => navigate("/about")}>
                          <i className="fas fa-users"></i> About SecureHer
                        </button>
                      </div>
                    </div>

                    {/* 🟢 Safety Tips Section */}
                    <div className="safety-tips glassy-card">
                      <h3><i className="fas fa-lightbulb"></i> Safety Tips</h3>
                      <ul>
                        <li>Always share your live location with trusted contacts.</li>
                        <li>Keep your emergency contacts updated.</li>
                        <li>Stay in well-lit and public areas when possible.</li>
                        <li>Trust your instincts – leave unsafe situations quickly.</li>
                      </ul>
                    </div>

                    {/* 📖 How It Works */}
                    <div className="how-it-works glassy-card">
                      <h3><i className="fas fa-info-circle"></i> How SecureHer Works</h3>
                      <p>Tap the Emergency Alert button to notify contacts, record audio, and share your location instantly.</p>
                    </div>

                    {/* 🚨 Emergency Helplines */}
                    <div className="helplines glassy-card">
                      <h3><i className="fas fa-phone-alt"></i> Emergency Numbers</h3>
                      <p>Police: <strong>112</strong></p>
                      <p>Women Helpline: <strong>1090</strong></p>
                      <p>Ambulance: <strong>108</strong></p>
                    </div>

                    {/* 👩 About SecureHer */}
                    <div className="about-app glassy-card">
                      <h3><i className="fas fa-users"></i> About SecureHer</h3>
                      <p>SecureHer is a safety-first emergency alert app designed to empower women by providing instant SOS alerts, location sharing, and secure audio evidence.</p>
                    </div>
                  </>
                ) : (
                  <div className="login-prompt glassy-card">
                    <i className="fas fa-lock"></i>
                    <p>Please log in to access emergency features</p>
                    <button className="login-btn-prompt" onClick={() => navigate("/login")}>
                      <i className="fas fa-sign-in-alt"></i> Login to Continue
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="emergency-active">
                {emergencyStatus === "sending" && (
                  <div className="recording-indicator">
                    <div className="pulse-ring"></div>
                    <i className="fas fa-microphone glow"></i>
                    <span>Recording: {recordingTime}s / 10s</span>
                    <button className="cancel-btn" onClick={cancelEmergency}>
                      <i className="fas fa-times"></i> Cancel
                    </button>
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
                    <button onClick={cancelEmergency}>Try Again</button>
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
