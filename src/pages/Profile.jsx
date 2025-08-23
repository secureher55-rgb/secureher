import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import "../styles/Profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    emergencyContact: "",
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // For success/error messages

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();

  // 🔹 Load user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.createdAt?.seconds) {
              data.createdAt = new Date(
                data.createdAt.seconds * 1000
              ).toLocaleDateString();
            }

            setProfile(data);
            setFormData({
              name: data.name || "",
              email: data.email || currentUser.email,
              mobile: data.mobile || "",
              emergencyContact: data.emergencyContact || "",
            });
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 🔹 Form change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Photo change
  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
    }
  };

  // 🔹 Save profile
  const handleSave = async () => {
    try {
      let photoURL = user.photoURL;

      // Upload new photo if selected
      if (newPhoto) {
        setUploading(true);
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, newPhoto);
        photoURL = await getDownloadURL(storageRef);

        // Update Firebase Auth photo
        await updateProfile(user, { photoURL });
        setUploading(false);
      }

      // Update email in Firebase Auth (requires recent login)
      try {
        if (formData.email !== user.email) {
          await updateEmail(user, formData.email);
        }
      } catch (err) {
        console.warn("Email update requires recent login, updating only Firestore.");
      }

      // Update Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        emergencyContact: formData.emergencyContact,
        photoURL: photoURL,
      });

      // Update local state
      setProfile({
        ...profile,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        emergencyContact: formData.emergencyContact,
        photoURL: photoURL,
      });

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("");
        setIsEditing(false);
        setNewPhoto(null);
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
      setUploading(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  if (!user) {
    return (
      <div className="profile-login-message glassy-card">
        <i className="fas fa-user-lock"></i>
        <p>Please login to view your profile</p>
        <button className="login-redirect-btn" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card glassy-card">
        {/* Save Status Indicator */}
        {saveStatus === "success" && (
          <div className="save-status success">
            <i className="fas fa-check-circle"></i>
            Profile updated successfully!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="save-status error">
            <i className="fas fa-exclamation-circle"></i>
            Error updating profile. Please try again.
          </div>
        )}

        {/* Header Section */}
        <div className="profile-header">
          <div className="avatar-container">
            <img
              className="profile-avatar"
              src={
                newPhoto
                  ? URL.createObjectURL(newPhoto)
                  : profile?.photoURL ||
                    user.photoURL ||
                    "https://i.pravatar.cc/150?img=12"
              }
              alt="Profile"
            />
            {isEditing && (
              <label className="avatar-upload-btn">
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
          
          <div className="profile-titles">
            <h2>{profile?.name || "User"}</h2>
            <p>{profile?.email || user.email}</p>
            {profile?.mobile && <p className="profile-mobile">{profile.mobile}</p>}
          </div>
        </div>

        <div className="divider"></div>

        {/* View Mode */}
        {!isEditing ? (
          <>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-icon">
                  <i className="fas fa-fingerprint"></i>
                </span>
                <div className="info-content">
                  <span className="info-label">User ID</span>
                  <span className="info-value">{user.uid.substring(0, 10)}...</span>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">
                  <i className="fas fa-calendar-alt"></i>
                </span>
                <div className="info-content">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{profile?.createdAt || "N/A"}</span>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">
                  <i className="fas fa-mobile-alt"></i>
                </span>
                <div className="info-content">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value">{profile?.mobile || "Not set"}</span>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">
                <i class="fas fa-exclamation-triangle"></i> 
                </span>
                <div className="info-content">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">{profile?.emergencyContact || "Not set"}</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="profile-actions">
              <button className="btn-primary" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit"></i> Edit Profile
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <div className="edit-form">
            <div className="form-group">
              <label>
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-mobile-alt"></i> Mobile Number
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
              />
            </div>
            
            <div className="form-group">
              <label>
              <i class="fas fa-exclamation-triangle"></i>  Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Enter emergency contact number"
              />
            </div>
            
            <div className="form-group">
              <label className="file-upload-label">
                <i className="fas fa-image"></i> Profile Picture
                <span className="upload-hint">Click the camera icon on your avatar to change photo</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Changes
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
                disabled={uploading}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;