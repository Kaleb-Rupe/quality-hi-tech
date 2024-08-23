const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with your Firebase user UID
const uid = process.env.UUID_SECRET_KEY;

admin
    .auth()
    .setCustomUserClaims(uid, {superadmin: true})
    .then(() => {
      console.log("Superadmin role added successfully");
      process.exit();
    })
    .catch((error) => {
      console.error("Error adding superadmin role:", error);
      process.exit(1);
    });
