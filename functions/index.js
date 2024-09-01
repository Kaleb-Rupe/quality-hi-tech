const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

exports.listUsers = functions.https.onCall(async (data, context) => {
  console.log("listUsers function called");
  console.log("Auth context:", context.auth);

  if (!context.auth) {
    console.log("No auth context found");
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to list users.",
    );
  }

  if (!context.auth.token.admin) {
    console.log("User is not an admin");
    throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an admin to list users.",
    );
  }

  try {
    console.log("Attempting to list users");
    const listUsersResult = await admin.auth().listUsers();
    console.log("Users fetched successfully");
    return listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    }));
  } catch (error) {
    console.error("Error in listUsers function:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Error listing users: " + error.message,
    );
  }
});

exports.removeUser = functions.https.onCall(async (data, context) => {
  console.log("removeUser function called");
  console.log("Auth context:", context.auth);

  if (!context.auth) {
    console.log("No auth context found");
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to remove users.",
    );
  }

  if (!context.auth.token.admin) {
    console.log("User is not an admin");
    throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an admin to remove users.",
    );
  }

  try {
    await admin.auth().deleteUser(data.uid);
    console.log(`User ${data.uid} removed successfully`);
    return {success: true, message: "User removed successfully"};
  } catch (error) {
    console.error("Error in removeUser function:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Error removing user: " + error.message,
    );
  }
});

exports.createInvoice = functions.https.onCall(async (data, context) => {
  console.log("createInvoice function called");
  console.log("Auth context:", context.auth);

  if (!context.auth) {
    console.log("No auth context found");
    throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to create an invoice.",
    );
  }

  const {customerEmail, customerName, amount, description} = data;

  try {
    console.log("Creating Stripe customer");
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName,
    });

    console.log("Creating invoice item");
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: amount * 100, // Stripe uses cents
      currency: "usd",
      description: description,
    });

    console.log("Creating invoice");
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
      auto_advance: true,
    });

    console.log("Sending invoice");
    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    console.log("Invoice created and sent successfully");
    return {
      success: true,
      invoiceId: sentInvoice.id,
      invoiceUrl: sentInvoice.hosted_invoice_url,
    };
  } catch (error) {
    console.error("Error in createInvoice function:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Error creating invoice: " + error.message,
    );
  }
});

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Check if the caller has permission to set admin claims
  const callerUid = context.auth.uid;
  const callerSnap = await admin.auth().getUser(callerUid);
  const callerClaims = callerSnap.customClaims;

  if (!callerClaims || !callerClaims.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can set admin claims.",
    );
  }

  const {uid} = data;

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {admin: true});

    console.log(`Admin claim set successfully for user: ${uid}`);
    return {success: true, message: "Admin claim set successfully"};
  } catch (error) {
    console.error("Error in setAdminClaim function:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Error setting admin claim: " + error.message,
    );
  }
});

exports.resendVerificationEmail = functions.https.onCall(
    async (data, context) => {
      if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an admin to resend verification emails.",
        );
      }

      try {
        const user = await admin.auth().getUser(data.uid);
        if (user.emailVerified) {
          throw new functions.https.HttpsError(
              "failed-precondition",
              "User email is already verified.",
          );
        }

        await admin.auth().generateEmailVerificationLink(user.email);

        return {success: true, message: "Verification email sent successfully"};
      } catch (error) {
        console.error("Error resending verification email:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Error resending verification email: " + error.message,
        );
      }
    },
);
