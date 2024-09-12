const admin = require("firebase-admin");
const adminSettingsFunctions = require("./src/adminSettings");
const invoiceManagementFunctions = require("./src/invoiceManagement");

// Make sure admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export the admin settings functions
exports.listAdminUsers = adminSettingsFunctions.listAdminUsers;
exports.editAdminUser = adminSettingsFunctions.editAdminUser;
exports.createNewAdmin = adminSettingsFunctions.createNewAdmin;
exports.deleteAdmin = adminSettingsFunctions.deleteAdmin;

// Export the invoice management functions
exports.createDraftInvoice = invoiceManagementFunctions.createDraftInvoice;
exports.listInvoices = invoiceManagementFunctions.listInvoices;
exports.syncInvoices = invoiceManagementFunctions.syncInvoices;
exports.handleStripeWebhook = invoiceManagementFunctions.handleStripeWebhook;
exports.manualSyncInvoices = invoiceManagementFunctions.manualSyncInvoices;
exports.deleteInvoice = invoiceManagementFunctions.deleteInvoice;
exports.voidInvoice = invoiceManagementFunctions.voidInvoice;
exports.getInvoicePdf = invoiceManagementFunctions.getInvoicePdf;
exports.cleanupOldPdfs = invoiceManagementFunctions.cleanupOldPdfs;
exports.getInvoicePaymentLink = invoiceManagementFunctions.getInvoicePaymentLink;
