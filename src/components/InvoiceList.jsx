import React, { useState, useEffect, useCallback, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import "../css/invoice-list.css";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const toast = useRef(null);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 20,
    page: 1,
    status: null,
  });

  const [pdfDialogVisible, setPdfDialogVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [paymentLinkDialogVisible, setPaymentLinkDialogVisible] =
    useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Open", value: "open" },
    { label: "Paid", value: "paid" },
    { label: "Uncollectible", value: "uncollectible" },
    { label: "Void", value: "void" },
  ];

  const loadLazyData = useCallback(() => {
    setLoading(true);
    const listInvoices = httpsCallable(functions, "listInvoices");
    listInvoices({
      page: lazyParams.page,
      pageSize: lazyParams.rows,
      status: lazyParams.status,
    })
      .then((result) => {
        setInvoices(result.data.invoices);
        setTotalRecords(result.data.totalCount);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch invoices: " + error.message,
        });
        setLoading(false);
      });
  }, [lazyParams]);

  useEffect(() => {
    loadLazyData();
  }, [loadLazyData]);

  const onPage = (event) => {
    setLazyParams(event);
  };

  const onFilter = (value) => {
    setLazyParams({
      ...lazyParams,
      first: 0,
      page: 1,
      status: value,
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`invoice-status invoice-status-${rowData.status}`}>
        {rowData.status}
      </span>
    );
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      const manualSyncInvoices = httpsCallable(functions, "manualSyncInvoices");
      const result = await manualSyncInvoices();
      if (result.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Synced ${result.data.count} invoices`,
        });
        loadLazyData();
      }
    } catch (error) {
      console.error("Error syncing invoices:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to sync invoices",
      });
    } finally {
      setLoading(false);
    }
  };

  const finalizeAndSendInvoice = async (invoiceId) => {
    try {
      const finalizeAndSendFunction = httpsCallable(
        functions,
        "finalizeAndSendInvoice"
      );
      await finalizeAndSendFunction({ invoiceId });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice finalized and sent",
      });
      loadLazyData();
    } catch (error) {
      console.error("Error finalizing and sending invoice:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to finalize and send invoice: " + error.message,
      });
    }
  };

  const viewPdf = async (invoiceId) => {
    try {
      setPdfLoading(true);
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
        errorMessage =
          "PDF not available for this invoice. It might be a draft.";
      }
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const viewPaymentPage = async (invoiceId) => {
    try {
      setPaymentLinkLoading(true);
      const getInvoicePaymentLink = httpsCallable(
        functions,
        "getInvoicePaymentLink"
      );
      const result = await getInvoicePaymentLink({ invoiceId });
      if (result.data.success) {
        setPaymentLink(result.data.paymentLink);
        setPaymentLinkDialogVisible(true);
      }
    } catch (error) {
      console.error("Error fetching payment link:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch payment link: " + error.message,
      });
    } finally {
      setPaymentLinkLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink).then(() => {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Payment link copied to clipboard",
      });
    });
  };

  const openInNewWindow = () => {
    window.open(paymentLink, "_blank");
  };

  const deleteInvoice = async (invoiceId) => {
    confirmDialog({
      message: "Are you sure you want to delete this invoice?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          setLoading(true);
          const deleteInvoiceFunction = httpsCallable(
            functions,
            "deleteInvoice"
          );
          await deleteInvoiceFunction({ invoiceId });
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Invoice deleted successfully",
          });
          loadLazyData();
        } catch (error) {
          console.error("Error deleting invoice:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete invoice: " + error.message,
          });
        } finally {
          setLoading(false);
        }
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Invoice deletion cancelled",
        });
      },
    });
  };

  const voidInvoice = async (invoiceId) => {
    confirmDialog({
      message: "Are you sure you want to void this invoice?",
      header: "Void Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          setLoading(true);
          const voidInvoiceFunction = httpsCallable(functions, "voidInvoice");
          await voidInvoiceFunction({ invoiceId });
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Invoice voided successfully",
          });
          loadLazyData();
        } catch (error) {
          console.error("Error voiding invoice:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to void invoice: " + error.message,
          });
        } finally {
          setLoading(false);
        }
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Invoice voiding cancelled",
        });
      },
    });
  };

  const markUncollectible = async (invoiceId) => {
    try {
      const markUncollectibleFunction = httpsCallable(
        functions,
        "markInvoiceUncollectible"
      );
      await markUncollectibleFunction({ invoiceId });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice marked as uncollectible",
      });
      loadLazyData();
    } catch (error) {
      console.error("Error marking invoice as uncollectible:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to mark invoice as uncollectible: " + error.message,
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="invoice-actions">
        {rowData.status === "draft" && (
          <>
            <Button
              icon="pi pi-send"
              className="p-button-rounded p-button-success"
              onClick={() => finalizeAndSendInvoice(rowData.id)}
              tooltip="Finalize and Send"
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteInvoice(rowData.id)}
              tooltip="Delete"
            />
          </>
        )}
        {rowData.status === "open" && (
          <>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-warning"
              onClick={() => voidInvoice(rowData.id)}
              tooltip="Void"
            />
            <Button
              icon="pi pi-exclamation-triangle"
              className="p-button-rounded p-button-danger"
              onClick={() => markUncollectible(rowData.id)}
              tooltip="Mark Uncollectible"
            />
          </>
        )}
        {(rowData.status === "open" || rowData.status === "draft") && (
          <Button
            icon="pi pi-dollar"
            className="p-button-rounded p-button-success"
            onClick={() => viewPaymentPage(rowData.id)}
            tooltip="View Payment Page"
            loading={paymentLinkLoading}
          />
        )}
        <Button
          icon="pi pi-file-pdf"
          className="p-button-rounded p-button-info"
          onClick={() => viewPdf(rowData.id)}
          tooltip="View PDF"
        />
      </div>
    );
  };

  const onCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogVisible(true);
  };

  const customerNameBodyTemplate = (rowData) => {
    return (
      <Button
        label={rowData.customerName}
        className="p-button-link"
        onClick={() => onCustomerSelect(rowData)}
      />
    );
  };

  return (
    <div className="invoice-list">
      <h2>Invoices</h2>
      <Toast ref={toast} />
      <div className="invoice-button-container">
        <Dropdown
          value={lazyParams.status}
          options={statusOptions}
          onChange={(e) => onFilter(e.value)}
          placeholder="Filter by Status"
          showClear
        />
        <Button
          label="Manual Sync"
          icon="pi pi-sync"
          onClick={handleManualSync}
          className="p-button-secondary invoice-sync-button"
        />
      </div>
      <DataTable
        value={invoices}
        lazy
        paginator
        totalRecords={totalRecords}
        first={lazyParams.first}
        rows={lazyParams.rows}
        onPage={onPage}
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage="No invoices found"
      >
        <Column
          field="customerName"
          header="Customer Name"
          body={customerNameBodyTemplate}
        />
        <Column field="customerEmail" header="Customer Email" />
        <Column
          field="amount"
          header="Amount"
          body={(rowData) => formatCurrency(rowData.amount)}
        />
        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column field="actions" header="Actions" body={actionBodyTemplate} />
      </DataTable>

      <Dialog
        header="Customer Details"
        visible={customerDialogVisible}
        style={{ width: "50vw" }}
        onHide={() => setCustomerDialogVisible(false)}
      >
        {selectedCustomer && (
          <div>
            <p>
              <strong>Name:</strong> {selectedCustomer.customerName}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.customerEmail}
            </p>
            <p>
              <strong>Invoice ID:</strong> {selectedCustomer.id}
            </p>
            <p>
              <strong>Amount:</strong> ${selectedCustomer.amount / 100}
            </p>
            <p>
              <strong>Status:</strong> {selectedCustomer.status}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedCustomer.dueDate * 1000).toLocaleDateString()}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedCustomer.created * 1000).toLocaleDateString()}
            </p>
            <p>
              <strong>Actions:</strong>
            </p>
            <div className="invoice-actions">
              {actionBodyTemplate(selectedCustomer)}
            </div>
            {/* Add more customer details as needed */}
          </div>
        )}
      </Dialog>

      <Dialog
        header="Invoice PDF"
        visible={pdfDialogVisible}
        style={{ width: "80vw" }}
        onHide={() => setPdfDialogVisible(false)}
      >
        {pdfLoading ? (
          <div className="pdf-loading">
            <ProgressSpinner />
            <p>Loading PDF...</p>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Invoice PDF"
          />
        ) : (
          <p>No PDF available</p>
        )}
      </Dialog>

      <ConfirmDialog
        visible={paymentLinkDialogVisible}
        onHide={() => setPaymentLinkDialogVisible(false)}
        message={
          <div>
            <p>Payment link:</p>
            <InputText value={paymentLink} readOnly style={{ width: "150%" }} />
          </div>
        }
        header="Invoice Payment Link"
        icon="pi pi-exclamation-triangle"
        accept={openInNewWindow}
        reject={copyToClipboard}
        acceptLabel="Open in New Window"
        rejectLabel="Copy to Clipboard"
      />
    </div>
  );
};

export default InvoiceList;
