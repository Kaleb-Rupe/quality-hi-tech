const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

exports.rotateSecretKey = functions.pubsub.schedule("0 0 1 * *").onRun(async context => {
  const newKey = crypto.randomBytes(32).toString("base64");
  
  const db = admin.firestore();
  const keyDoc = db.collection("secretKeys").doc("current");
  
  try {
    await keyDoc.set({ key: newKey, rotatedAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log("Secret key rotated successfully at:", new Date().toISOString());
    return null;
  } catch (error) {
    console.error("Error rotating secret key:", error);
    return null;
  }
});
