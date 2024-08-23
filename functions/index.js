const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(
    functions.config().stripe[
    process.env.NODE_ENV === "production" ? "secret_key.prod" : "secret_key.dev"
    ],
);
const {log, logLevels} = require("./logging");
const {getCache, setCache} = require("./caching");
const cors = require("cors")({origin: true});

// Initialize the Firebase Admin SDK
admin.initializeApp();

exports.createInvoice = functions
    .runWith({
      maxInstances: 10,
    })
    .https.onCall((data, context) => {
      return cors(data.rawRequest, data.rawResponse, async () => {
        let customer;
        let invoice;
        try {
          if (!context.auth) {
            log(
                logLevels.WARN,
                "Unauthenticated user attempted to create an invoice",
                {uid: "anonymous"},
            );
            throw new functions.https.HttpsError(
                "unauthenticated",
                "The function must be called while authenticated.",
            );
          }

          // Implement rate limiting
          const uid = context.auth.uid;
          const userRef = admin.firestore().collection("users").doc(uid);
          const snapshot = await userRef.get();
          const userData = snapshot.exists ? snapshot.data() : {};

          const now = Date.now();
          const lastInvoiceTime = userData.lastInvoiceTime || 0;
          const cooldownPeriod = 60 * 1000; // 1 minute cooldown

          if (now - lastInvoiceTime < cooldownPeriod) {
            log(logLevels.WARN, "Rate limit exceeded for user", {uid});
            throw new functions.https.HttpsError(
                "resource-exhausted",
                "Too many requests. Please try again later.",
            );
          }

          // Update last invoice time
          await userRef.update({lastInvoiceTime: now});

          const {email, amount, description} = data;
          log(logLevels.INFO, "Attempting to create invoice", {email, amount});

          customer = await stripe.customers.create({email: email});
          log(logLevels.INFO, "Created Stripe customer", {
            customerId: customer.id,
          });

          invoice = await stripe.invoices.create({
            customer: customer.id,
            collection_method: "send_invoice",
            days_until_due: 30,
          });
          log(logLevels.INFO, "Created Stripe invoice", {
            invoiceId: invoice.id,
          });

          await stripe.invoiceItems.create({
            customer: customer.id,
            amount: amount * 100,
            currency: "usd",
            invoice: invoice.id,
            description: description || "Invoice item",
          });
          log(logLevels.INFO, "Added invoice item to invoice", {
            invoiceId: invoice.id,
          });

          await stripe.invoices.finalizeInvoice(invoice.id);
          log(logLevels.INFO, "Finalized invoice", {invoiceId: invoice.id});

          await stripe.invoices.sendInvoice(invoice.id);
          log(logLevels.INFO, "Sent invoice", {invoiceId: invoice.id});

          log(logLevels.INFO, "Successfully created and sent invoice", {
            email,
            invoiceId: invoice.id,
          });
          return {
            success: true,
            message: "Invoice created and sent successfully",
          };
        } catch (error) {
          log(logLevels.ERROR, "Error creating invoice", {
            error: error.message,
            stack: error.stack,
          });

          let errorMessage = "Failed to create and send invoice";
          let errorCode = "internal";

          if (error.type === "StripeCardError") {
            errorMessage = error.message;
            errorCode = "invalid-argument";
          } else if (error.type === "StripeInvalidRequestError") {
            errorMessage = "Invalid request to Stripe API";
            errorCode = "invalid-argument";
          } else if (error.type === "StripeAPIError") {
            errorMessage = "Stripe API error occurred";
          } else if (error.type === "StripeConnectionError") {
            errorMessage = "Failed to connect to Stripe";
          } else if (error.type === "StripeAuthenticationError") {
            errorMessage = "Authentication with Stripe failed";
          }

          log(logLevels.ERROR, "Invoice creation failed", {
            errorMessage,
            errorCode,
          });
          throw new functions.https.HttpsError(errorCode, errorMessage);
        } finally {
          if (customer && !invoice) {
            await stripe.customers.del(customer.id);
            log(
                logLevels.INFO,
                "Deleted Stripe customer due to failed invoice creation",
                {customerId: customer.id},
            );
          }
        }
      });
    });

exports.listInvoices = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const {limit = 10, cursor, sortField, sortOrder, filters} = data;

    try {
      let invoicesQuery = stripe.invoices.list({
        limit: limit,
        customer: context.auth.uid,
        starting_after: cursor,
      });

      if (sortField) {
        invoicesQuery = invoicesQuery.sort({
          [sortField]: sortOrder === 1 ? "asc" : "desc",
        });
      }

      const invoices = await invoicesQuery;

      // Apply filters
      let filteredInvoices = invoices.data;
      if (filters) {
        filteredInvoices = filteredInvoices.filter((invoice) => {
          return Object.entries(filters).every(([key, value]) => {
            if (typeof value === "string") {
              return invoice[key].toLowerCase().includes(value.toLowerCase());
            }
            return true;
          });
        });
      }

      const totalCount = await stripe.invoices.count({
        customer: context.auth.uid,
      });

      return {
        success: true,
        invoices: filteredInvoices,
        totalCount: totalCount.count,
        lastCursor:
          filteredInvoices.length > 0 ?
            filteredInvoices[filteredInvoices.length - 1].id :
            null,
      };
    } catch (error) {
      console.error("Error listing invoices:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to list invoices",
      );
    }
  });
});

exports.deleteInvoice = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const {invoiceId} = data;

    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (invoice.customer !== context.auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You don't have permission to delete this invoice.",
        );
      }

      await stripe.invoices.voidInvoice(invoiceId);

      return {success: true, message: "Invoice voided successfully"};
    } catch (error) {
      console.error("Error voiding invoice:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to void invoice",
      );
    }
  });
});

exports.getInvoiceDetails = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const {invoiceId} = data;

    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (invoice.customer !== context.auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You don't have permission to view this invoice.",
        );
      }

      return {success: true, invoice};
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to fetch invoice details",
      );
    }
  });
});

exports.processPayment = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const {invoiceId, paymentMethodId} = data;

    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (invoice.customer !== context.auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "You don't have permission to pay this invoice.",
        );
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.amount_due,
        currency: invoice.currency,
        customer: invoice.customer,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
      });

      if (paymentIntent.status === "succeeded") {
        await stripe.invoices.pay(invoiceId);
        return {success: true, message: "Payment processed successfully"};
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      throw new functions.https.HttpsError(
          "internal",
          error.message || "Failed to process payment",
      );
    }
  });
});

exports.getInvoiceStats = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const cacheKey = `invoiceStats_${context.auth.uid}`;
    const cachedStats = await getCache(cacheKey);

    if (cachedStats) {
      return {success: true, stats: cachedStats};
    }

    try {
      const invoices = await stripe.invoices.list({
        customer: context.auth.uid,
        limit: 100, // Adjust this limit as needed
      });

      const stats = {
        totalCount: invoices.data.length,
        totalAmount: 0,
        paidCount: 0,
        unpaidCount: 0,
        overdueCount: 0,
      };

      invoices.data.forEach((invoice) => {
        stats.totalAmount += invoice.amount_due / 100;
        if (invoice.status === "paid") {
          stats.paidCount++;
        } else if (invoice.status === "open") {
          if (new Date(invoice.due_date * 1000) < new Date()) {
            stats.overdueCount++;
          } else {
            stats.unpaidCount++;
          }
        }
      });

      await setCache(cacheKey, stats);

      return {success: true, stats};
    } catch (error) {
      console.error("Error fetching invoice statistics:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to fetch invoice statistics",
      );
    }
  });
});

exports.getAdminStats = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Must be an admin to request admin statistics.",
      );
    }

    try {
      const usersSnapshot = await admin.firestore().collection("users").get();
      const invoicesSnapshot = await admin
          .firestore()
          .collection("invoices")
          .get();
      const paymentsSnapshot = await admin
          .firestore()
          .collection("payments")
          .get();

      const totalUsers = usersSnapshot.size;
      const totalInvoices = invoicesSnapshot.size;
      const totalPayments = paymentsSnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().amount,
          0,
      );

      return {
        success: true,
        stats: {
          totalUsers,
          totalInvoices,
          totalPayments,
        },
      };
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to fetch admin statistics",
      );
    }
  });
});

exports.getRecentActivities = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Must be an admin to request recent activities.",
      );
    }

    try {
      const activitiesSnapshot = await admin
          .firestore()
          .collection("activities")
          .orderBy("timestamp", "desc")
          .limit(10)
          .get();

      const activities = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        success: true,
        activities,
      };
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to fetch recent activities",
      );
    }
  });
});

exports.setUserRole = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    const rateLimitRef = admin
        .firestore()
        .collection("rateLimits")
        .doc(`setUserRole_${context.auth.uid}`);
    const snapshot = await rateLimitRef.get();
    const rateLimitData = snapshot.exists ? snapshot.data() : {count: 0, lastAttempt: 0};

    const now = Date.now();
    const cooldownPeriod = 60 * 1000; // 1 minute
    const maxAttempts = 5;

    if (now - rateLimitData.lastAttempt < cooldownPeriod) {
      if (rateLimitData.count >= maxAttempts) {
        throw new functions.https.HttpsError(
            "resource-exhausted",
            "Too many requests. Please try again later.",
        );
      }
    } else {
      rateLimitData.count = 0;
    }

    rateLimitData.count++;
    rateLimitData.lastAttempt = now;
    await rateLimitRef.set(rateLimitData);

    const callerUid = context.auth.uid;
    const callerUserRecord = await admin.auth().getUser(callerUid);
    const callerCustomClaims = callerUserRecord.customClaims || {};

    if (!callerCustomClaims.superadmin) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Only superadmins can set user roles.",
      );
    }

    const {uid, role} = data;

    const validRoles = ["user", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid role specified.",
      );
    }

    try {
      const claims = {};
      if (role === "admin") claims.admin = true;
      if (role === "superadmin") claims.superadmin = true;

      log(logLevels.INFO, "Attempting to set user role", {
        callerUid: context.auth.uid,
        targetUid: uid,
        newRole: role,
      });

      await admin.auth().setCustomUserClaims(uid, claims);
      return {
        success: true,
        message: `Role for user ${uid} set to ${role}`,
      };
    } catch (error) {
      console.error("Error setting user role:", error);
      throw new functions.https.HttpsError(
          "internal",
          "Failed to set user role",
      );
    }
  });
});

exports.checkLoginAttempts = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    const {email} = data;
    const ipAddress = context.rawRequest.ip;

    const loginAttemptsRef = admin.firestore().collection("loginAttempts");
    const userAttemptsRef = loginAttemptsRef.doc(email.replace(".", ","));
    const ipAttemptsRef = loginAttemptsRef.doc(
        `ip_${ipAddress.replace(/\./g, "_")}`,
    );

    try {
      const [userSnapshot, ipSnapshot] = await Promise.all([
        userAttemptsRef.get(),
        ipAttemptsRef.get(),
      ]);

      const userAttempts = userSnapshot.exists ?
        userSnapshot.data() :
        {count: 0, lastAttempt: 0};
      const ipAttempts = ipSnapshot.exists ?
        ipSnapshot.data() :
        {count: 0, lastAttempt: 0};

      const now = Date.now();
      const cooldownPeriod = 15 * 60 * 1000; // 15 minutes
      const maxAttempts = 5;

      if (now - userAttempts.lastAttempt > cooldownPeriod) {
        userAttempts.count = 0;
      }
      if (now - ipAttempts.lastAttempt > cooldownPeriod) {
        ipAttempts.count = 0;
      }

      if (
        userAttempts.count >= maxAttempts ||
        ipAttempts.count >= maxAttempts
      ) {
        const remainingTime = Math.ceil(
            (cooldownPeriod -
            (now -
              Math.max(userAttempts.lastAttempt, ipAttempts.lastAttempt))) /
            60000,
        );
        throw new functions.https.HttpsError(
            "resource-exhausted",
            `Too many login attempts. 
            Please try again in ${remainingTime} minutes.`,
        );
      }

      await Promise.all([
        userAttemptsRef.set({
          count: userAttempts.count + 1,
          lastAttempt: now,
        }),
        ipAttemptsRef.set({count: ipAttempts.count + 1, lastAttempt: now}),
      ]);

      return {allowed: true};
    } catch (error) {
      console.error("Error in checkLoginAttempts:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred while checking login attempts.",
      );
    }
  });
});

exports.resendVerificationEmail = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    const {email} = data;

    if (!email) {
      log(logLevels.WARN, "Resend verification email attempt without email", {
        email,
      });
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Email is required.",
      );
    }

    // Implement rate limiting
    const rateLimitRef = admin
        .firestore()
        .collection("rateLimits")
        .doc(`resendVerification_${email.replace(/\./g, ",")}`);
    const snapshot = await rateLimitRef.get();
    const rateLimitData = snapshot.exists ?
      snapshot.data() :
      {count: 0, lastAttempt: 0};

    const now = Date.now();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
    const maxAttempts = 3;

    if (now - rateLimitData.lastAttempt < cooldownPeriod) {
      if (rateLimitData.count >= maxAttempts) {
        log(
            logLevels.WARN,
            "Rate limit exceeded for resend verification email",
            {email},
        );
        throw new functions.https.HttpsError(
            "resource-exhausted",
            "Too many requests. Please try again later.",
        );
      }
    } else {
      rateLimitData.count = 0;
    }

    rateLimitData.count++;
    rateLimitData.lastAttempt = now;
    await rateLimitRef.set(rateLimitData);

    try {
      const user = await admin.auth().getUserByEmail(email);

      if (user.emailVerified) {
        log(
            logLevels.INFO,
            "Resend verification email attempt for already verified email",
            {email},
        );
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Email is already verified.",
        );
      }

      const link = await admin.auth().generateEmailVerificationLink(email);

      // Here you would typically send the email with the verification link
      // For this example, we'll just log it
      log(logLevels.INFO, "Verification email link generated", {email, link});

      return {
        success: true,
        message: "Verification email sent successfully.",
      };
    } catch (error) {
      log(logLevels.ERROR, "Error resending verification email", {
        email,
        error: error.message,
      });
      if (error.code === "auth/user-not-found") {
        throw new functions.https.HttpsError(
            "not-found",
            "No user found with this email.",
        );
      }
      throw new functions.https.HttpsError(
          "internal",
          "Failed to resend verification email.",
      );
    }
  });
});

exports.refreshToken = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      log(logLevels.WARN, "Unauthenticated user attempted to refresh token", {
        uid: "anonymous",
      });
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    try {
      const uid = context.auth.uid;
      const userRecord = await admin.auth().getUser(uid);

      // Check if the user account is disabled
      if (userRecord.disabled) {
        log(logLevels.WARN, "Disabled user attempted to refresh token", {
          uid,
          email: userRecord.email,
        });
        throw new functions.https.HttpsError(
            "permission-denied",
            "User account is disabled. Please contact support.",
        );
      }

      // Revoke all refresh tokens for the user
      await admin.auth().revokeRefreshTokens(uid);

      // Create a new custom token
      const customToken = await admin.auth().createCustomToken(uid);

      log(logLevels.INFO, "Token refreshed successfully", {uid});

      return {token: customToken};
    } catch (error) {
      log(logLevels.ERROR, "Error refreshing token", {
        uid: context.auth.uid,
        error: error.message,
      });
      throw new functions.https.HttpsError(
          "internal",
          "Unable to refresh token",
      );
    }
  });
});

exports.authenticateUser = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth) {
      log(logLevels.WARN, "Unauthenticated user attempted to authenticate", {
        uid: "anonymous",
      });
      throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated.",
      );
    }

    try {
      const uid = context.auth.uid;
      const userRecord = await admin.auth().getUser(uid);
      const customClaims = userRecord.customClaims || {};

      // Check if the user's email is verified
      if (!userRecord.emailVerified) {
        log(logLevels.WARN, "Unverified user attempted to authenticate", {
          uid,
          email: userRecord.email,
        });
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Email not verified. Please verify your email before proceeding.",
        );
      }

      // Check if the user account is disabled
      if (userRecord.disabled) {
        log(logLevels.WARN, "Disabled user attempted to authenticate", {
          uid,
          email: userRecord.email,
        });
        throw new functions.https.HttpsError(
            "permission-denied",
            "User account is disabled. Please contact support.",
        );
      }

      log(logLevels.INFO, "User authenticated successfully", {
        uid,
        email: userRecord.email,
      });

      return {
        uid: uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        isAdmin: !!customClaims.admin,
        isSuperAdmin: !!customClaims.superadmin,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        creationTime: userRecord.metadata.creationTime,
      };
    } catch (error) {
      log(logLevels.ERROR, "Error authenticating user", {
        uid: context.auth.uid,
        error: error.message,
      });
      throw new functions.https.HttpsError(
          "internal",
          "Failed to authenticate user",
      );
    }
  });
});

exports.listUsers = functions.https.onCall((data, context) => {
  return cors(data.rawRequest, data.rawResponse, async () => {
    if (!context.auth || !context.auth.token.superadmin) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Must be a superadmin to list users.",
      );
    }

    const {pageSize = 100, pageToken} = data;

    try {
      const cacheKey = `users_${pageSize}_${pageToken || "start"}`;
      const cachedResult = await getCache(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const listUsersResult = await admin.auth().listUsers(pageSize, pageToken);
      const userList = listUsersResult.users.map((user) => ({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.customClaims?.superadmin ?
          "superadmin" :
          user.customClaims?.admin ?
          "admin" :
          "user",
      }));

      const result = {
        success: true,
        users: userList,
        nextPageToken: listUsersResult.pageToken,
      };

      await setCache(cacheKey, result, 300); // Cache for 5 minutes

      return result;
    } catch (error) {
      log(logLevels.ERROR, "Error listing users", {error: error.message});
      throw new functions.https.HttpsError("internal", "Failed to list users");
    }
  });
});
