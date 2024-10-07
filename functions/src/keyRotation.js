const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

exports.rotateSecretKey = functions.pubsub.schedule("0 0 1 * *").onRun(async context => {
  const newKey = crypto.randomBytes(32).toString("base64");
  
  const db = admin.firestore();
  const keyDoc = db.collection("secretKeys").doc("current");
  
  try {
    await keyDoc.set({ key: newKey });
    console.log("Secret key rotated successfully");
    return null;
  } catch (error) {
    console.error("Error rotating secret key:", error);
    return null;
  }
});

exports.initializeSecretKey = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin to initialize the secret key.");
  }

  const db = admin.firestore();
  const keyDoc = db.collection("secretKeys").doc("current");

  try {
    const doc = await keyDoc.get();
    if (!doc.exists) {
      const newKey = crypto.randomBytes(32).toString("base64");
      await keyDoc.set({ key: newKey });
      console.log("Secret key initialized successfully");
    }
    return { success: true };
  } catch (error) {
    console.error("Error initializing secret key:", error);
    throw new functions.https.HttpsError("internal", "Failed to initialize secret key");
  }
});
