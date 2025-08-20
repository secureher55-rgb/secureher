import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getFirestore, collection, getDocs, addDoc, 
  doc, updateDoc, arrayUnion, Timestamp 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import EmergencyButton from "../components/EmergencyButton";
import ContactSelector from "../components/ContactSelector";
import "../styles/home.scss";

// Initialize Firebase
import { app } from "../firebase/config";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [emergencyStatus, setEmergencyStatus] = useState("idle");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadUserContacts(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
      
      // Start timer for 10 seconds
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
      const audioBlob = await simulateAudioRecording();
      
      const audioRef = ref(storage, `emergency-recordings/${user.uid}/${Date.now()}.webm`);
      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);
      
      const alertData = {
        userId: user.uid,
        timestamp: Timestamp.now(),
        contacts: selectedContacts,
        audioUrl,
        location: await getCurrentLocation(),
        status: "sent"
      };
      
      const alertRef = await addDoc(collection(db, "emergencyAlerts"), alertData);
      
      await updateDoc(doc(db, "users", user.uid), {
        emergencyAlerts: arrayUnion(alertRef.id)
      });
      
      await sendNotificationsToContacts(selectedContacts, alertRef.id);
      
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

  const simulateAudioRecording = () => {
    return new Blob([new ArrayBuffer(0)], { type: 'audio/webm' });
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  const sendNotificationsToContacts = async (contacts, alertId) => {
    console.log("Sending notifications to:", contacts, "Alert ID:", alertId);
  };

  const cancelEmergency = () => {
    clearInterval(recordingTimerRef.current);
    setIsEmergencyMode(false);
    setEmergencyStatus("idle");
    setRecordingTime(0);
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1>SecureHer</h1>
        </div>
        
        <div className="nav-links">
          <button 
            className="nav-link"
            onClick={() => navigate("/info")}
          >
            <i className="fas fa-info-circle"></i>
            How It Works
          </button>
          
          <button 
            className="nav-link"
            onClick={() => navigate("/safety-tips")}
          >
            <i className="fas fa-lightbulb"></i>
            Safety Tips
          </button>
          
          {user ? (
            <div className="user-menu">
              <button 
                className="nav-link"
                onClick={() => navigate("/profile")}
              >
                <i className="fas fa-address-book"></i>
                Manage Contacts
              </button>
              
              <div className="user-info">
                <div 
                  className="user-avatar"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <p className="user-email">{user.email}</p>
                    <button 
                      className="dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      <i className="fas fa-user-cog"></i>
                      Profile Settings
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleSignOut}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button className="nav-link login-btn" onClick={handleLogin}>
              <i className="fas fa-user"></i>
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <p className="tagline">Your safety is our priority</p>
          </div>
          
          <div className="content">
            {!isEmergencyMode ? (
              <>
                <p className="welcome-text">Welcome to your personal safety app</p>
                <p className="instruction">Select emergency contacts and press the button in case of emergency</p>
                
                {user ? (
                  <>
                    <ContactSelector 
                      contacts={contacts}
                      selectedContacts={selectedContacts}
                      setSelectedContacts={setSelectedContacts}
                    />
                    
                    <EmergencyButton 
                      onEmergencyCall={handleEmergencyCall} 
                      disabled={selectedContacts.length === 0}
                    />
                  </>
                ) : (
                  <div className="login-prompt">
                    <div className="login-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <p className="login-message">Please log in to access emergency features</p>
                    <button className="login-btn-prompt" onClick={handleLogin}>
                      <i className="fas fa-sign-in-alt"></i>
                      Login to Continue
                    </button>
                  </div>
                )}
                
                <div className="quick-actions">
                  <h3>Quick Access</h3>
                  <div className="action-buttons">
                    <button 
                      className="action-btn"
                      onClick={() => navigate("/safety-tips")}
                    >
                      <i className="fas fa-lightbulb"></i>
                      <span>Safety Tips</span>
                    </button>
                    
                    <button 
                      className="action-btn"
                      onClick={() => navigate("/info")}
                    >
                      <i className="fas fa-info-circle"></i>
                      <span>How It Works</span>
                    </button>
                    
                    {user && (
                      <button 
                        className="action-btn"
                        onClick={() => navigate("/profile")}
                      >
                        <i className="fas fa-address-book"></i>
                        <span>Manage Contacts</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="emergency-active">
                <div className="emergency-status">
                  {emergencyStatus === "sending" && (
                    <>
                      <div className="recording-indicator">
                        <div className="pulse-ring"></div>
                        <i className="fas fa-microphone"></i>
                        <span>Recording in progress: {recordingTime}s / 10s</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(recordingTime / 10) * 100}%` }}
                        ></div>
                      </div>
                      <p className="alert-info">Sending alert to {selectedContacts.length} contact(s)...</p>
                    </>
                  )}
                  
                  {emergencyStatus === "sent" && (
                    <>
                      <div className="success-message">
                        <div className="success-icon">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <h3>Emergency Alert Sent!</h3>
                        <p>Your alert has been sent to your selected contacts.</p>
                        <p>Help is on the way.</p>
                      </div>
                    </>
                  )}
                  
                  {emergencyStatus === "error" && (
                    <>
                      <div className="error-message">
                        <div className="error-icon">
                          <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <h3>Error Sending Alert</h3>
                        <p>Please try again or contact emergency services directly.</p>
                      </div>
                      <button className="cancel-btn" onClick={cancelEmergency}>
                        Try Again
                      </button>
                    </>
                  )}
                </div>
                
                {emergencyStatus === "sending" && (
                  <button className="cancel-btn" onClick={cancelEmergency}>
                    <i className="fas fa-times"></i>
                    Cancel Emergency Alert
                  </button>
                )}
              </div>
            )}
          </div>
          
          <footer className="footer">
            <p>Powered by SecureHer & C-DAC Thiruvananthapuram</p>
          </footer>
        </div>
      </div>
    </div>
  );
}