// ✅ Firebase Functions v2
const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const twilio = require("twilio");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// ✅ Limit concurrent instances
setGlobalOptions({maxInstances: 10});

// 🔹 Load Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioNumber = process.env.TWILIO_FROM;

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  logger.info("✅ Twilio client initialized");
} else {
  logger.error("⚠️ Missing Twilio credentials. SMS will fail.");
}

// 🔹 Health check endpoint (required by Cloud Run)
exports.health = onRequest((req, res) => {
  res.status(200).send("✅ Service is healthy");
});

// 🔹 Cloud Function: sendSOS
exports.sendSOS = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated.",
    );
  }

  const {phone, message} = request.data;

  if (!phone || !message) {
    throw new HttpsError(
      "invalid-argument",
      "Phone number and message are required.",
    );
  }

  if (!client) {
    throw new HttpsError(
      "failed-precondition",
      "Twilio is not configured correctly.",
    );
  }

  try {
    const response = await client.messages.create({
      body: message,
      to: phone,
      from: twilioNumber,
    });

    logger.info(`✅ SMS sent: ${response.sid}`);
    return {success: true, sid: response.sid};
  } catch (error) {
    logger.error("❌ Twilio error:", error);
    throw new HttpsError("internal", "Failed to send SMS: " + error.message);
  }
});

// 🔹 Cloud Function: findUserByMobile (Updated)
exports.findUserByMobile = onCall({cors: true}, async (request) => {
  const {mobile} = request.data;

  if (!mobile) {
    throw new HttpsError("invalid-argument", "Mobile number is required.");
  }

  try {
    const db = admin.firestore();
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("mobile", "==", mobile).get();

    if (querySnapshot.empty) {
      return {exists: false};
    }

    // Return user data without sensitive information
    const userData = querySnapshot.docs[0].data();
    return {
      exists: true,
      userId: querySnapshot.docs[0].id,
      name: userData.name,
      email: userData.email,
    };
  } catch (error) {
    console.error("❌ Error finding user by mobile:", error);
    throw new HttpsError("internal", "Error finding user: " + error.message);
  }
});
