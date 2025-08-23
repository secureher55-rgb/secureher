const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const twilio = require("twilio");

// ✅ Limit cost / concurrent instances
setGlobalOptions({maxInstances: 10});

// 🔹 Use Firebase config with fallback to environment variables
const functions = require("firebase-functions");
// Load environment variables for local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Get Twilio configuration with fallbacks
const getTwilioConfig = () => {
  try {
    const config = functions.config();
    if (config && config.twilio) {
      return config.twilio;
    }
  } catch (error) {
    logger.warn("Could not load functions config, using environment variables");
  }

  // Fallback to environment variables
  return {
    sid: process.env.TWILIO_SID,
    token: process.env.TWILIO_TOKEN,
    from: process.env.TWILIO_FROM,
  };
};

const twilioConfig = getTwilioConfig();
const accountSid = twilioConfig.sid;
const authToken = twilioConfig.token;
const twilioNumber = twilioConfig.from;

// Check if we have the required configuration
if (!accountSid || !authToken || !twilioNumber) {
  logger.error("Missing Twilio configuration. Please set functions config or environment variables.");
  // Don't throw an error here to allow the function to be deployed
  // We'll handle the missing configuration in the function itself
}

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  logger.warn("Twilio client not initialized due to missing configuration");
}

exports.sendSOS = onCall({cors: true}, async (request) => {
  // Ensure the request is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  const {phone, message} = request.data;

  if (!phone || !message) {
    logger.error("Missing phone or message");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Phone number and message are required",
    );
  }

  // Check if Twilio client is initialized
  if (!client) {
    logger.error("Twilio client not initialized - missing configuration");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "SMS service is not configured properly",
    );
  }

  try {
    const response = await client.messages.create({
      body: message,
      to: phone,
      from: twilioNumber,
    });

    logger.info("✅ SOS Sent:", response.sid);
    return {success: true, sid: response.sid};
  } catch (error) {
    logger.error("❌ Twilio SMS error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to send SMS: " + error.message,
    );
  }
});
