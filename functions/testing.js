const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret_key, {
  apiVersion: "2023-08-16",
  maxNetworkRetries: 3,
});

admin.initializeApp();

exports.createDraftInvoice = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin rights
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User must be an authenticated admin to create a draft invoice.",
    );
  }

  const { customerEmail, customerName, items, description, dueDate, status } =
    data;

  // Basic validation
  if (!customerEmail || !customerName || !items || items.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields",
    );
  }

  try {
    // Create or retrieve Stripe customer
    let customer = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
    } else {
      customer = customer.data[0];
    }

    // Create invoice items
    const invoiceItems = items.map(item => ({
      customer: customer.id,
      unit_amount: item.unit_amount,
      currency: "usd",
      description: item.description,
      quantity: item.quantity,
    }));

    await Promise.all(
      invoiceItems.map(item => stripe.invoiceItems.create(item)),
    );

    // Create draft invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: false, // Prevents automatic finalization
      collection_method: "send_invoice",
      description: description,
      due_date: Math.floor(dueDate.getTime() / 1000),
      auto_tax: { enabled: false },
    });

    // Calculate total amount
    const totalAmount =
      invoiceItems.reduce(
        (sum, item) => sum + item.unit_amount * item.quantity,
        0,
      ) / 100;

    // Store draft invoice details in Firestore
    const invoiceDoc = await admin
      .firestore()
      .collection("invoices")
      .add({
        stripeInvoiceId: invoice.id,
        stripeCustomerId: customer.id,
        customerEmail,
        customerName,
        items: invoiceItems,
        description,
        status,
        dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        amount: totalAmount,
      });

    return {
      success: true,
      invoiceId: invoice.id,
      firestoreDocId: invoiceDoc.id,
    };
  } catch (error) {
    console.error("Error creating draft invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating draft invoice: " + error.message,
    );
  }
});

exports.finalizeSendInvoice = functions.https.onCall(async (data, context) => {
  // Check authentication and admin rights
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User must be an authenticated admin to finalize and send an invoice.",
    );
  }

  const { firestoreDocId } = data;

  try {
    // Retrieve invoice details from Firestore
    const invoiceDoc = await admin
      .firestore()
      .collection("invoices")
      .doc(firestoreDocId)
      .get();
    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }
    const invoiceData = invoiceDoc.data();

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      invoiceData.stripeInvoiceId,
    );

    // Send the invoice
    const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Update Firestore document
    await invoiceDoc.ref.update({
      status: sentInvoice.status,
      dueDate: new Date(sentInvoice.due_date * 1000),
      invoiceUrl: sentInvoice.hosted_invoice_url,
      pdfUrl: sentInvoice.invoice_pdf,
    });

    return {
      success: true,
      invoiceId: sentInvoice.id,
      invoiceUrl: sentInvoice.hosted_invoice_url,
      pdfUrl: sentInvoice.invoice_pdf,
    };
  } catch (error) {
    console.error("Error finalizing and sending invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error finalizing and sending invoice: " + error.message,
    );
  }
});

exports.editInvoice = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and has admin rights
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User must be an authenticated admin to edit an invoice.",
    );
  }

  const {
    firestoreDocId,
    customerName,
    customerEmail,
    items,
    description,
    dueDate,
    status,
  } = data;

  try {
    // Get the invoice from Firestore
    const invoiceRef = admin
      .firestore()
      .collection("invoices")
      .doc(firestoreDocId);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }

    const invoiceData = invoiceDoc.data();

    // Update customer information if changed
    if (
      customerName !== invoiceData.customerName ||
      customerEmail !== invoiceData.customerEmail
    ) {
      await stripe.customers.update(invoiceData.stripeCustomerId, {
        name: customerName,
        email: customerEmail,
      });
    }

    // Delete existing invoice items
    const existingItems = await stripe.invoiceItems.list({
      invoice: invoiceData.stripeInvoiceId,
    });
    await Promise.all(
      existingItems.data.map(item => stripe.invoiceItems.del(item.id)),
    );

    // Create new invoice items
    const newInvoiceItems = items.map(item => ({
      customer: invoiceData.stripeCustomerId,
      unit_amount: item.unit_amount,
      currency: "usd",
      description: item.description,
      quantity: item.quantity,
      invoice: invoiceData.stripeInvoiceId,
    }));

    await Promise.all(
      newInvoiceItems.map(item => stripe.invoiceItems.create(item)),
    );

    // Update invoice in Stripe
    await stripe.invoices.update(invoiceData.stripeInvoiceId, {
      description: description,
      due_date: Math.floor(dueDate.getTime() / 1000),
    });

    // Update Firestore document
    await invoiceRef.update({
      customerName,
      customerEmail,
      items,
      description,
      dueDate: dueDate.toDate(),
      status,
    });

    return { success: true, message: "Invoice updated successfully" };
  } catch (error) {
    console.error("Error editing invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error editing invoice: " + error.message,
    );
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
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
  case "invoice.paid":
    await updateInvoiceStatus(event.data.object.id, "paid");
    break;
  case "invoice.payment_failed":
    await updateInvoiceStatus(event.data.object.id, "payment_failed");
    break;
    // ... handle other event types
  default:
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

const updateInvoiceStatus = async (stripeInvoiceId, status) => {
  const invoiceRef = admin
    .firestore()
    .collection("invoices")
    .where("stripeInvoiceId", "==", stripeInvoiceId);
  const snapshot = await invoiceRef.get();

  if (snapshot.empty) {
    console.log("No matching invoice found");
    return;
  }

  snapshot.forEach(doc => {
    doc.ref.update({ status: status });
  });
};

exports.listInvoices = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to list invoices.",
    );
  }

  const { page = 1, pageSize = 20, status } = data;

  try {
    // Fetch invoices from Stripe and store in Firestore
    const stripeInvoices = await stripe.invoices.list({ limit: 100 });
    const batch = admin.firestore().batch();
    stripeInvoices.data.forEach(invoice => {
      const invoiceRef = admin
        .firestore()
        .collection("invoices")
        .doc(invoice.id);
      batch.set(
        invoiceRef,
        {
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer,
          customerEmail: invoice.customer_email,
          customerName: invoice.customer_name,
          amount: invoice.total / 100,
          status: invoice.status,
          dueDate: admin.firestore.Timestamp.fromDate(
            new Date(invoice.due_date * 1000),
          ),
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(invoice.created * 1000),
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });
    await batch.commit();

    // Query Firestore for invoices
    let query = admin
      .firestore()
      .collection("invoices")
      .orderBy("createdAt", "desc");
    if (status) {
      query = query.where("status", "==", status);
    }

    const totalCount = (await query.count().get()).data().count;
    const invoicesSnapshot = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    const invoices = invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      dueDate: doc.data().dueDate.toDate(),
    }));

    return {
      success: true,
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

exports.getInvoiceDetails = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to get invoice details.",
    );
  }

  const { invoiceId } = data;

  try {
    const invoiceDoc = await admin
      .firestore()
      .collection("invoices")
      .doc(invoiceId)
      .get();
    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }
    return {
      success: true,
      invoice: { id: invoiceDoc.id, ...invoiceDoc.data() },
    };
  } catch (error) {
    console.error("Error getting invoice details:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error getting invoice details: " + error.message,
    );
  }
});

exports.updateInvoiceStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to update invoice status.",
    );
  }

  const { invoiceId, newStatus } = data;

  try {
    await admin
      .firestore()
      .collection("invoices")
      .doc(invoiceId)
      .update({ status: newStatus });
    return { success: true, message: "Invoice status updated successfully" };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error updating invoice status: " + error.message,
    );
  }
});

exports.finalizeAndSendInvoice = functions.https.onCall(
  async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an admin to finalize and send invoices.",
      );
    }

    const { invoiceId } = data;

    try {
      const invoiceDoc = await admin
        .firestore()
        .collection("invoices")
        .doc(invoiceId)
        .get();
      if (!invoiceDoc.exists) {
        throw new Error("Invoice not found");
      }

      const invoiceData = invoiceDoc.data();
      const stripeInvoice = await stripe.invoices.finalizeInvoice(
        invoiceData.stripeInvoiceId,
      );
      await stripe.invoices.sendInvoice(stripeInvoice.id);

      await invoiceDoc.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Invoice finalized and sent successfully",
      };
    } catch (error) {
      console.error("Error finalizing and sending invoice:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error finalizing and sending invoice: " + error.message,
      );
    }
  },
);

exports.deleteDraftInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to delete invoices.",
    );
  }

  const { invoiceId } = data;

  try {
    const invoiceDoc = await admin
      .firestore()
      .collection("invoices")
      .doc(invoiceId)
      .get();
    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData.status !== "draft") {
      throw new Error("Only draft invoices can be deleted");
    }

    await stripe.invoices.del(invoiceData.stripeInvoiceId);
    await invoiceDoc.ref.delete();

    return { success: true, message: "Draft invoice deleted successfully" };
  } catch (error) {
    console.error("Error deleting draft invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting draft invoice: " + error.message,
    );
  }
});

exports.editDraftInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to edit invoices.",
    );
  }

  const { invoiceId, updatedData } = data;

  try {
    const invoiceDoc = await admin
      .firestore()
      .collection("invoices")
      .doc(invoiceId)
      .get();
    if (!invoiceDoc.exists) {
      throw new Error("Invoice not found");
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData.status !== "draft") {
      throw new Error("Only draft invoices can be edited");
    }

    // Update Stripe invoice
    await stripe.invoices.update(invoiceData.stripeInvoiceId, {
      description: updatedData.description,
      due_date: updatedData.dueDate
        ? Math.floor(updatedData.dueDate.getTime() / 1000)
        : undefined,
    });

    // Update invoice items
    // First, delete existing items
    const existingItems = await stripe.invoiceItems.list({
      invoice: invoiceData.stripeInvoiceId,
    });
    await Promise.all(
      existingItems.data.map(item => stripe.invoiceItems.del(item.id)),
    );

    // Then, create new items
    await Promise.all(
      updatedData.items.map(item =>
        stripe.invoiceItems.create({
          customer: invoiceData.stripeCustomerId,
          unit_amount: item.unit_amount,
          currency: "usd",
          description: item.description,
          quantity: item.quantity,
          invoice: invoiceData.stripeInvoiceId,
        }),
      ),
    );

    // Update Firestore document
    await invoiceDoc.ref.update(updatedData);

    return { success: true, message: "Draft invoice updated successfully" };
  } catch (error) {
    console.error("Error editing draft invoice:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error editing draft invoice: " + error.message,
    );
  }
});
