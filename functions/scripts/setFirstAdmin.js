const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with the user's UID
const uid = "MiorIpNyBNP11zPlgP64t1HN8yg1";

admin
    .auth()
    .setCustomUserClaims(uid, {admin: true})
    .then(() => {
      console.log("Admin claim set successfully");
      process.exit();
    })
    .catch((error) => {
      console.error("Error setting admin claim:", error);
      process.exit(1);
    });
