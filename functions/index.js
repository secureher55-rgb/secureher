const { setGlobalOptions } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const twilio = require("twilio");

// ✅ Limit cost / concurrent instances
setGlobalOptions({ maxInstances: 10 });

// 🔹 Setup Twilio (move credentials to Firebase environment variables)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

/**
 * 🔹 Cloud Function to send SMS via Twilio
 * Call this from your React app using Firebase Functions SDK
 */
exports.sendSOS = onCall(async (request) => {
  const { phone, message } = request.data;

  if (!phone || !message) {
    logger.error("Missing phone or message");
    throw new Error("Phone number and message are required");
  }

  try {
    const response = await client.messages.create({
      body: message,
      to: phone, // Recipient
      from: twilioNumber, // Your Twilio number
    });

    logger.info("✅ SOS Sent:", response.sid);
    return { success: true, sid: response.sid };
  } catch (error) {
    logger.error("❌ Twilio SMS error:", error);
    return { success: false, error: error.message };
  }
});
