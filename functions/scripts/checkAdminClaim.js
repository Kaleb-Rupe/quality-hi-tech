const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Replace with the UID of the user you're checking
const uid = "MiorIpNyBNP11zPlgP64t1HN8yg1";

admin
  .auth()
  .getUser(uid)
  .then(userRecord => {
    console.log("User custom claims:", userRecord.customClaims);
    process.exit();
  })
  .catch(error => {
    console.error("Error fetching user:", error);
    process.exit(1);
  });
