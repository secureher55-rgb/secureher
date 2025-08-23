import React, { useState, useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { sendSOS } from "../utils/sendSOS"; // 🔹 Import SOS SMS sender
import "../styles/EmergencyButton.scss";

const EmergencyButton = ({ onEmergencyCall }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [statusText, setStatusText] = useState("Emergency Alert 🚨");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // 🔹 Status helpers
  const getStatusType = (statusText) => {
    if (statusText.includes("Recording")) return "recording";
    if (statusText.includes("Uploading")) return "uploading";
    if (statusText.includes("Sent")) return "sent";
    if (statusText.includes("Failed") || statusText.includes("Denied")) return "error";
    return "default";
  };

  const getStatusIcon = (statusText) => {
    if (statusText.includes("Recording")) return "🎤";
    if (statusText.includes("Uploading")) return "☁️";
    if (statusText.includes("Sent")) return "✅";
    if (statusText.includes("Failed") || statusText.includes("Denied")) return "❌";
    return "🚨";
  };

  const getStatusMessage = (statusText) => {
    if (statusText.includes("Recording")) return "Recording in progress...";
    if (statusText.includes("Uploading")) return "Uploading your alert...";
    if (statusText.includes("Sent")) return "Alert successfully sent!";
    if (statusText.includes("Failed")) return "Failed to send alert. Please try again.";
    if (statusText.includes("Denied")) return "Microphone access denied.";
    return "Press to send emergency alert";
  };

  const handleClick = async () => {
    setIsCalling(true);
    setRecordingTime(0);
    setStatusText("🎤 Recording...");

    let stream;
    try {
      // 🎤 Request mic access
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setStatusText("☁️ Uploading & Sending...");

        try {
          let audioUrl = null;
          let location = null;

          // ✅ Upload audio
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            audioUrl = await uploadToFirebase(audioBlob);
          }

          // 🌍 Get location
          location = await getCurrentLocation();

          // ✅ Notify parent (if needed)
          if (onEmergencyCall) {
            onEmergencyCall({
              audioUrl: audioUrl || null,
              location: location || null,
              timestamp: new Date().toISOString(),
            });
          }

          // 📩 Send SOS via Firebase Function
          const phone = "+91XXXXXXXXXX"; // 🔹 Replace with trusted contact
          const message = `🚨 Emergency Alert!\n
            Location: ${
              location
                ? `https://maps.google.com/?q=${location.lat},${location.lng}`
                : "Not Available"
            }\n
            Audio: ${audioUrl || "Not Available"}\n
            Time: ${new Date().toLocaleString()}`;

          const response = await sendSOS(phone, message);

          if (response.success) {
            setStatusText("✅ Alert Sent!");
          } else {
            setStatusText("❌ Failed to Send");
          }
        } catch (err) {
          console.error("Error sending alert:", err);
          setStatusText("❌ Failed to Send");
        } finally {
          setTimeout(() => cleanup(stream), 2000); // reset after 2s
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      // ⏱ Auto-stop after 10s
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        setRecordingTime(elapsed);
        if (elapsed >= 10) {
          clearInterval(timerRef.current);
          if (recorder.state !== "inactive") recorder.stop();
        }
      }, 1000);
    } catch (error) {
      console.error("Microphone access error:", error);
      setStatusText("❌ Mic Access Denied");
      cleanup(stream);
    }
  };

  // 🔹 Upload audio
  const uploadToFirebase = async (blob) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("User must be logged in to upload recordings.");
        return null;
      }

      const storage = getStorage();
      const fileName = `emergency_recording_${Date.now()}.webm`;
      const storageRef = ref(storage, `audioRecordings/${user.uid}/${fileName}`);

      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  // 🔹 Get location
  const getCurrentLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          (err) => {
            console.error("Location error:", err);
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    });

  // 🔹 Cleanup
  const cleanup = (stream) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setIsCalling(false);
    setStatusText("Emergency Alert 🚨");
    setRecordingTime(0);
  };

  return (
    <div className="emergency-button-container">
      <button
        className={`emergency-btn ${isCalling ? "pulsing" : ""}`}
        data-status={getStatusType(statusText)}
        onClick={handleClick}
        disabled={isCalling}
        aria-label="Emergency call button"
      >
        <span className="btn-icon">{getStatusIcon(statusText)}</span>
        {isCalling && statusText.includes("Recording")
          ? `Recording (${10 - recordingTime}s)`
          : statusText}
      </button>

      {isCalling && (
        <div className={`status-indicator ${getStatusType(statusText)}`}>
          {getStatusMessage(statusText)}
        </div>
      )}
    </div>
  );
};

export default EmergencyButton;
