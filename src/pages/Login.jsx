import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "../styles/login.scss";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setSuccessMessage("");
    setOtpSent(false);
    setFormData({
      name: "",
      email: "",
      mobile: "",
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
      if (!formData.mobile.trim()) {
        setError("Please enter your mobile number");
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
    
    if (isLoginMode && !formData.mobile && !formData.email) {
      setError("Please enter your email or mobile number");
      return false;
    }
    
    if (!isLoginMode && !formData.email) {
      setError("Please enter your email address");
      return false;
    }
    
    if (!formData.password) {
      setError("Please enter your password");
      return false;
    }
    return true;
  };

  // Function to find user by mobile number
  const findUserByMobile = async (mobile) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("mobile", "==", mobile));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
      return null;
    } catch (error) {
      console.error("Error finding user by mobile:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isLoginMode) {
        // Check if user is trying to login with mobile number
        if (formData.mobile) {
          // Look up user by mobile number to get their email
          const userData = await findUserByMobile(formData.mobile);
          
          if (!userData || !userData.email) {
            setError("No account found with this mobile number");
            setIsLoading(false);
            return;
          }
          
          // Sign in with email and password using the email associated with the mobile number
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            userData.email, 
            formData.password
          );
          
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          if (userDoc.exists()) console.log("User data:", userDoc.data());
          navigate("/");
        } else {
          // Regular email login
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
          );
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          if (userDoc.exists()) console.log("User data:", userDoc.data());
          navigate("/");
        }
      } else {
        // Sign up with email and mobile
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          createdAt: new Date(),
          emergencyContacts: [],
          emergencyAlerts: []
        });
        
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/"), 1500);
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
      setIsLoading(true);
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
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
      case "auth/invalid-phone-number":
        return "Invalid phone number format.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="auth-card glassy-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="auth-title">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {isLoginMode
              ? "Sign in to continue to SecureHer"
              : "Join SecureHer for your safety"}
          </p>
        </div>

        {error && (
          <div className="auth-message error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-message success-message">
            <i className="fas fa-check-circle"></i>
            <span>{successMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
                className="form-input"
              />
            </div>
          )}

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-mobile-alt"></i> 
              {isLoginMode ? "Email or Mobile Number" : "Mobile Number"}
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder={isLoginMode ? "Enter your email or mobile number" : "Enter your mobile number"}
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-lock"></i> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className="form-input"
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
                className="form-input"
              />
            </div>
          )}

          {isLoginMode && (
            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" disabled={isLoading} />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {isLoginMode ? "Signing in..." : "Creating account..."}
              </>
            ) : isLoginMode ? (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={toggleMode}
              className="switch-mode-btn"
            >
              {isLoginMode ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-auth">
          <button className="social-btn google-btn" disabled={isLoading}>
            <i className="fab fa-google"></i>
            Google
          </button>
          <button className="social-btn facebook-btn" disabled={isLoading}>
            <i className="fab fa-facebook-f"></i>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;