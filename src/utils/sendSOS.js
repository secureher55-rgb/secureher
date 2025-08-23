// src/utils/sendSOS.js
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase/config"; 

// ✅ Initialize functions once
let sendSOSFn;
try {
  const functions = getFunctions(app, "us-central1"); // region of your CF
  sendSOSFn = httpsCallable(functions, "sendSOS");
} catch (err) {
  console.error("❌ Failed to initialize Firebase Functions:", err);
}

/**
 * Send SOS SMS via Firebase Cloud Function (Twilio)
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
export async function sendSOS(phone, message) {
  console.log("📩 sendSOS() called with:", { phone, message }); // 👈 add this

  try {
    if (!sendSOSFn) {
      throw new Error("Firebase Functions not initialized");
    }
    if (!phone || !message) {
      throw new Error("Phone number and message are required");
    }

    const result = await sendSOSFn({ phone, message });
    return result.data;
  } catch (error) {
    console.error("❌ Error sending SOS:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

