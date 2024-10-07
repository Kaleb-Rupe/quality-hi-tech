const admin = require("firebase-admin");
const adminSettingsFunctions = require("./src/adminSettings");
const invoiceManagementFunctions = require("./src/invoiceManagement");
const keyRotation = require("./src/keyRotation");
require("dotenv").config();

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
exports.getInvoicePaymentLink =
  invoiceManagementFunctions.getInvoicePaymentLink;
exports.finalizeAndSendInvoice =
  invoiceManagementFunctions.finalizeAndSendInvoice;
exports.markInvoiceUncollectible =
  invoiceManagementFunctions.markInvoiceUncollectible;
exports.updateInvoiceAndItems =
  invoiceManagementFunctions.updateInvoiceAndItems;
exports.deleteInvoiceItem = invoiceManagementFunctions.deleteInvoiceItem;
exports.invalidateToken = invoiceManagementFunctions.invalidateToken;
exports.updateCacheAfterInvoiceModification =
  invoiceManagementFunctions.updateCacheAfterInvoiceModification;

exports.rotateSecretKey = keyRotation.rotateSecretKey;
exports.initializeSecretKey = keyRotation.initializeSecretKey;
