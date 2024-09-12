const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const axios = require("axios");

// Make sure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.createDraftInvoice = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin rights
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User must be an authenticated admin to create a draft invoice.",
    );
  }

  try {
    const { customerEmail, customerName, items } = data;

    // Check if the customer already exists in Stripe
    let customer;
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      // Create a new customer if they don't exist
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
    }

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 30,
      auto_advance: false, // This keeps the invoice in a draft state
      metadata: {
        createdBy: context.auth.uid,
      },
    });

    // Add invoice items to the invoice
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
        currency: "usd",
      });
    }

    // Update invoice settings
    await stripe.invoices.update(invoice.id, {
      payment_settings: {
        payment_method_types: ["card", "cashapp", "us_bank_account"],
      },
    });

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Error creating draft invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating draft invoice: " + error.message,
    );
  }
});

exports.listInvoices = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to list invoices.",
    );
  }

  const { page = 1, pageSize = 20, status } = data;

  try {
    const db = admin.firestore();
    let query = db.collection("invoices").orderBy("created", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }

    const totalCount = (await query.count().get()).data().count;
    const snapshot = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      invoices,
      totalCount,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error("Error listing invoices:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error listing invoices: " + error.message,
    );
  }
});

// Add a new function to sync invoices periodically
exports.syncInvoices = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async context => {
    const db = admin.firestore();
    const invoicesRef = db.collection("invoices");

    try {
      // Get the latest invoice from Firestore
      const latestInvoiceSnapshot = await invoicesRef
        .orderBy("created", "desc")
        .limit(1)
        .get();

      let latestInvoiceDate = 0;
      if (!latestInvoiceSnapshot.empty) {
        latestInvoiceDate = latestInvoiceSnapshot.docs[0].data().created;
      }

      // Fetch new invoices from Stripe
      const newInvoices = await stripe.invoices.list({
        limit: 100,
        created: { gt: latestInvoiceDate },
        expand: ["data.customer"],
      });

      // Store new invoices in Firestore
      const batch = db.batch();
      newInvoices.data.forEach(invoice => {
        const invoiceData = {
          id: invoice.id,
          customerName: invoice.customer.name,
          customerEmail: invoice.customer.email,
          amount: invoice.amount_due,
          status: invoice.status,
          dueDate: invoice.due_date,
          created: invoice.created,
        };
        batch.set(invoicesRef.doc(invoice.id), invoiceData);
      });
      await batch.commit();

      console.log(`Synced ${newInvoices.data.length} new invoices`);
      return null;
    } catch (error) {
      console.error("Error syncing invoices:", error);
      return null;
    }
  });

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const endpointSecret = functions.config().stripe.webhook_secret;

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "invoice.created" || event.type === "invoice.updated") {
    const invoice = event.data.object;
    await updateInvoiceInFirestore(invoice);
  }

  res.json({ received: true });
});

async function updateInvoiceInFirestore(invoice) {
  const db = admin.firestore();
  const invoiceRef = db.collection("invoices").doc(invoice.id);

  await invoiceRef.set(
    {
      id: invoice.id,
      customerName: invoice.customer_name || "Unknown",
      customerEmail: invoice.customer_email || "Unknown",
      amount: invoice.total || 0,
      status: invoice.status || "unknown",
      dueDate: invoice.due_date
        ? admin.firestore.Timestamp.fromDate(new Date(invoice.due_date * 1000))
        : null,
      created: invoice.created
        ? admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000))
        : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

exports.manualSyncInvoices = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to sync invoices.",
    );
  }

  try {
    const db = admin.firestore();
    const invoicesRef = db.collection("invoices");

    // Fetch all invoices from Stripe
    const allInvoices = await stripe.invoices.list({
      limit: 100, // Adjust as needed
      expand: ["data.customer"],
    });

    // Store all invoices in Firestore
    const batch = db.batch();
    allInvoices.data.forEach(invoice => {
      const invoiceData = {
        id: invoice.id,
        customerName: invoice.customer?.name || "Unknown",
        customerEmail: invoice.customer?.email || "Unknown",
        amount: invoice.amount_due || 0,
        status: invoice.status || "unknown",
        dueDate: invoice.due_date
          ? admin.firestore.Timestamp.fromDate(
            new Date(invoice.due_date * 1000),
          )
          : null,
        created: invoice.created
          ? admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000))
          : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(invoicesRef.doc(invoice.id), invoiceData, { merge: true });
    });
    await batch.commit();

    console.log(`Synced ${allInvoices.data.length} invoices`);
    return { success: true, count: allInvoices.data.length };
  } catch (error) {
    console.error("Error syncing invoices:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error syncing invoices: " + error.message,
    );
  }
});

exports.finalizeAndSendInvoice = functions.https.onCall(
  async (data, context) => {
    // Implement logic to finalize and send invoice
  },
);

exports.deleteInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to delete invoices.",
    );
  }

  const { invoiceId } = data;

  try {
    // Delete invoice from Stripe
    await stripe.invoices.del(invoiceId);

    // Delete invoice from Firestore
    const db = admin.firestore();
    await db.collection("invoices").doc(invoiceId).delete();

    return { success: true, message: "Invoice deleted successfully" };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting invoice: " + error.message,
    );
  }
});

exports.voidInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to void invoices.",
    );
  }

  const { invoiceId } = data;

  try {
    // Void invoice in Stripe
    const voidedInvoice = await stripe.invoices.voidInvoice(invoiceId);

    // Update invoice status in Firestore
    const db = admin.firestore();
    await db.collection("invoices").doc(invoiceId).update({
      status: voidedInvoice.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Invoice voided successfully" };
  } catch (error) {
    console.error("Error voiding invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error voiding invoice: " + error.message,
    );
  }
});

exports.markInvoiceUncollectible = functions.https.onCall(
  async (data, context) => {
    // Implement logic to mark invoice as uncollectible
  },
);

exports.getInvoicePdf = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to fetch invoice PDFs.",
    );
  }

  const { invoiceId } = data;
  const bucket = admin.storage().bucket();
  const file = bucket.file(`invoices/${invoiceId}.pdf`);

  try {
    // Check if the file already exists in Storage
    const [exists] = await file.exists();
    let signedUrl;

    if (!exists) {
      // If the file doesn't exist, fetch it from Stripe and upload to Storage
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (!invoice.invoice_pdf) {
        throw new functions.https.HttpsError(
          "not-found",
          "PDF not available for this invoice. It might be a draft.",
        );
      }

      const response = await axios.get(invoice.invoice_pdf, {
        responseType: "arraybuffer",
      });

      await file.save(response.data, {
        metadata: {
          contentType: "application/pdf",
          invoiceId: invoiceId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // Get a signed URL for the file (whether it was just uploaded or already existed)
    [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    });

    return { success: true, pdfUrl: signedUrl };
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Error fetching invoice PDF: " + error.message,
    );
  }
});

// New function to clean up old PDFs
exports.cleanupOldPdfs = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async context => {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ prefix: "invoices/" });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const createdAt = new Date(metadata.timeCreated);

      if (createdAt < thirtyDaysAgo) {
        await file.delete();
        console.log(`Deleted old PDF: ${file.name}`);
      }
    }

    console.log("Cleanup of old PDFs completed");
    return null;
  });

exports.getInvoicePaymentLink = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an admin to fetch invoice payment links.",
      );
    }

    const { invoiceId } = data;

    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (invoice.status !== "open") {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invoice is not open. Current status: ${invoice.status}`,
        );
      }

      let paymentLink;

      if (invoice.hosted_invoice_url) {
        paymentLink = invoice.hosted_invoice_url;
      } else {
        // If hosted_invoice_url is null, we need to finalize the invoice first
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(
          invoiceId,
        );
        paymentLink = finalizedInvoice.hosted_invoice_url;

        if (!paymentLink) {
          throw new functions.https.HttpsError(
            "not-found",
            "Payment link not available for this invoice even after finalization",
          );
        }
      }

      // Update Firestore with the payment link
      const db = admin.firestore();
      await db.collection("invoices").doc(invoiceId).update({
        paymentLink: paymentLink,
        status: "open",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, paymentLink };
    } catch (error) {
      console.error("Error fetching invoice payment link:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error fetching invoice payment link: " + error.message,
      );
    }
  },
);