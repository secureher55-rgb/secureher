import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "../styles/login.scss";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  const validateForm = () => {
    if (!isLoginMode) {
      if (!formData.name.trim()) {
        setError("Please enter your name");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }
    
    if (!formData.email) {
      setError("Please enter your email address");
      return false;
    }
    
    if (!formData.password) {
      setError("Please enter your password");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      if (isLoginMode) {
        // Login logic
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          console.log("User data:", userDoc.data());
        }
        
        // Navigate to home page on successful login
        navigate("/");
      } else {
        // Signup logic
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          createdAt: new Date(),
          emergencyContacts: [],
          emergencyAlerts: []
        });
        
        // Navigate to home page on successful signup
        navigate("/");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address first");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(getErrorMessage(error.code));
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <i className="fas fa-shield-alt"></i>
            </div>
          </div>
          <h1>{isLoginMode ? "SecureHer Login" : "Create Account"}</h1>
          <p className="tagline">
            {isLoginMode ? "Access your safety account" : "Join SecureHer for your safety"}
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required={!isLoginMode}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required={!isLoginMode}
                disabled={isLoading}
              />
            </div>
          )}
          
          {isLoginMode && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" disabled={isLoading} />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-link"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                {isLoginMode ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              <>
                <i className={isLoginMode ? "fas fa-sign-in-alt" : "fas fa-user-plus"}></i>
                {isLoginMode ? "Login to Account" : "Create Account"}
              </>
            )}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="switch-mode-btn" onClick={toggleMode}>
              {isLoginMode ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
        
        <footer className="login-footer">
          <p>Powered by SecureHer & C-DAC Thiruvananthapuram</p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;