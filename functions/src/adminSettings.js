const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Make sure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.listAdminUsers = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  try {
    const userRecord = await admin.auth().getUser(context.auth.uid);

    // Check if the authenticated user is an admin
    const isAdmin =
      userRecord.customClaims && userRecord.customClaims.admin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "The function must be called by an admin user.",
      );
    }

    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(
      user => user.customClaims && user.customClaims.admin === true,
    );

    return adminUsers.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims,
    }));
  } catch (error) {
    console.error("Error listing admin users:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error listing admin users",
    );
  }
});

exports.editAdminUser = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  try {
    const callerUserRecord = await admin.auth().getUser(context.auth.uid);

    // Check if the authenticated user is an admin
    const isAdmin =
      callerUserRecord.customClaims &&
      callerUserRecord.customClaims.admin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "The function must be called by an admin user.",
      );
    }

    const { uid, displayName, email } = data;

    if (!uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid uid.",
      );
    }

    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (email) updateData.email = email;

    await admin.auth().updateUser(uid, updateData);

    return { message: "User updated successfully" };
  } catch (error) {
    console.error("Error editing admin user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error editing admin user",
    );
  }
});

exports.createNewAdmin = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  try {
    const callerUserRecord = await admin.auth().getUser(context.auth.uid);

    // Check if the authenticated user is an admin
    const isAdmin =
      callerUserRecord.customClaims &&
      callerUserRecord.customClaims.admin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "The function must be called by an admin user.",
      );
    }

    const { email, password, displayName } = data;

    if (!email || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email and password are required.",
      );
    }

    // Create the new user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false,
    });

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    return {
      uid: userRecord.uid,
      message: "New admin user created successfully",
    };
  } catch (error) {
    console.error("Error creating new admin user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating new admin user: " + error.message,
    );
  }
});

exports.deleteAdmin = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  try {
    const callerUserRecord = await admin.auth().getUser(context.auth.uid);

    // Check if the authenticated user is an admin
    const isAdmin =
      callerUserRecord.customClaims &&
      callerUserRecord.customClaims.admin === true;

    if (!isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "The function must be called by an admin user.",
      );
    }

    const { uid } = data;

    if (!uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid uid.",
      );
    }

    // Check if the user to be deleted is not the last admin
    const listUsersResult = await admin.auth().listUsers();
    const adminUsers = listUsersResult.users.filter(
      user => user.customClaims && user.customClaims.admin === true,
    );

    if (adminUsers.length === 1 && adminUsers[0].uid === uid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Cannot delete the last admin user.",
      );
    }

    // Delete the user
    await admin.auth().deleteUser(uid);

    return { message: "Admin user deleted successfully" };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting admin user: " + error.message,
    );
  }
});
