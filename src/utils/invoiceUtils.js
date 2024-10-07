import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
};

export const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Paid", value: "paid" },
  { label: "Uncollectible", value: "uncollectible" },
  { label: "Void", value: "void" },
];

export const isInvoiceEditable = (status) => {
  return status === "draft";
};

export const fetchInvoices = async (params, setInvoices, setTotalRecords, toast) => {
  try {
    const listInvoices = httpsCallable(functions, "listInvoices");
    const result = await listInvoices(params);
    const invoicesWithItems = result.data.invoices.map((invoice) => ({
      ...invoice,
      invoiceItems: invoice.invoiceItems || [],
    }));
    setInvoices(invoicesWithItems);
    setTotalRecords(result.data.totalCount);
    return result.data.totalCount;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to fetch invoices: " + error.message,
    });
    throw error;
  }
};

export const finalizeAndSendInvoice = async (
  invoiceId,
  toast,
  refreshInvoices,
  setLoadingStates,
  resetDialog
) => {
  try {
    setLoadingStates((prev) => ({
      ...prev,
      [`finalize_${invoiceId}`]: true,
    }));
    const finalizeAndSendFunction = httpsCallable(
      functions,
      "finalizeAndSendInvoice"
    );
    const result = await finalizeAndSendFunction({ invoiceId });
    if (result.data.success) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice finalized and sent successfully",
      });
      refreshInvoices();
      resetDialog();
      return result.data;
    } else {
      throw new Error(
        result.data.message || "Failed to finalize and send invoice"
      );
    }
  } catch (error) {
    console.error("Error finalizing and sending invoice:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to finalize and send invoice: " + error.message,
    });
    throw error;
  } finally {
    setLoadingStates((prev) => ({
      ...prev,
      [`finalize_${invoiceId}`]: false,
    }));
  }
};

export const voidInvoice = async (
  invoiceId,
  toast,
  refreshInvoices,
  setLoadingStates,
  resetDialog // Add this parameter
) => {
  try {
    setLoadingStates((prev) => ({ ...prev, [`void_${invoiceId}`]: true }));
    const voidFunction = httpsCallable(functions, "voidInvoice");
    const result = await voidFunction({ invoiceId });
    if (result.data.success) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice voided successfully",
      });
      refreshInvoices();
      resetDialog(); // Call this to reset the dialog
    } else {
      throw new Error(result.data.error || "Failed to void invoice");
    }
  } catch (error) {
    console.error("Error voiding invoice:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to void invoice",
    });
    throw error;
  } finally {
    setLoadingStates((prev) => ({ ...prev, [`void_${invoiceId}`]: false }));
  }
};

export const markUncollectible = async (
  invoiceId,
  toast,
  refreshInvoices,
  setLoadingStates,
  resetDialog // Add this parameter
) => {
  try {
    setLoadingStates((prev) => ({
      ...prev,
      [`uncollectible_${invoiceId}`]: true,
    }));
    const markUncollectibleFunction = httpsCallable(
      functions,
      "markInvoiceUncollectible"
    );
    const result = await markUncollectibleFunction({ invoiceId });
    if (result.data.success) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice marked as uncollectible",
      });
      refreshInvoices();
      resetDialog(); // Call this to reset the dialog
    } else {
      throw new Error(
        result.data.error || "Failed to mark invoice as uncollectible"
      );
    }
  } catch (error) {
    console.error("Error marking invoice as uncollectible:", error);
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to mark invoice as uncollectible",
    });
    throw error;
  } finally {
    setLoadingStates((prev) => ({ ...prev, [`uncollectible_${invoiceId}`]: false }));
  }
};

export const viewPdf = async (invoiceId, setLoadingStates, setPdfUrl, setPdfDialogVisible, toast) => {
  try {
    setLoadingStates((prev) => ({ ...prev, [`pdf_${invoiceId}`]: true }));
    const getInvoicePdf = httpsCallable(functions, "getInvoicePdf");
    const result = await getInvoicePdf({ invoiceId });
    if (result.data.success) {
      setPdfUrl(result.data.pdfUrl);
      setPdfDialogVisible(true);
    }
  } catch (error) {
    console.error("Error fetching invoice PDF:", error);
    let errorMessage = "Failed to fetch invoice PDF";
    if (error.code === "not-found") {
      errorMessage = "PDF not available for this invoice. It might be a draft.";
    }
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
    });
  } finally {
    setLoadingStates((prev) => ({ ...prev, [`pdf_${invoiceId}`]: false }));
  }
};