import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const listInvoicesFunction = httpsCallable(functions, "listInvoices");
      const result = await listInvoicesFunction();
      if (result.data.success) {
        setInvoices(result.data.invoices);
      } else {
        throw new Error(result.data.error || "Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch invoices",
      });
    }
  };

  const viewPdf = async (invoice) => {
    try {
      const generatePdfFunction = httpsCallable(functions, "generateInvoicePDF");
      const result = await generatePdfFunction({ invoiceId: invoice.id });
      if (result.data.success) {
        setSelectedInvoice({ ...invoice, pdfUrl: result.data.pdfUrl });
        setShowPdfDialog(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to generate PDF",
      });
    }
  };

  const finalizeInvoice = async (invoice) => {
    confirmDialog({
      message: 'Are you sure you want to finalize this invoice?',
      header: 'Confirm Finalization',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const finalizeFunction = httpsCallable(functions, "finalizeAndSendInvoice");
          const result = await finalizeFunction({ invoiceId: invoice.id });
          if (result.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Invoice finalized and sent successfully",
            });
            fetchInvoices(); // Refresh the invoice list
          } else {
            throw new Error(result.data.error || "Failed to finalize invoice");
          }
        } catch (error) {
          console.error("Error finalizing invoice:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to finalize invoice",
          });
        }
      },
    });
  };

  const voidInvoice = async (invoice) => {
    confirmDialog({
      message: 'Are you sure you want to void this invoice?',
      header: 'Confirm Void',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const voidFunction = httpsCallable(functions, "voidInvoice");
          const result = await voidFunction({ invoiceId: invoice.id });
          if (result.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Invoice voided successfully",
            });
            fetchInvoices(); // Refresh the invoice list
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
        }
      },
    });
  };

  const markUncollectible = async (invoice) => {
    confirmDialog({
      message: 'Are you sure you want to mark this invoice as uncollectible?',
      header: 'Confirm Uncollectible',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const markUncollectibleFunction = httpsCallable(functions, "markInvoiceUncollectible");
          const result = await markUncollectibleFunction({ invoiceId: invoice.id });
          if (result.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Invoice marked as uncollectible",
            });
            fetchInvoices(); // Refresh the invoice list
          } else {
            throw new Error(result.data.error || "Failed to mark invoice as uncollectible");
          }
        } catch (error) {
          console.error("Error marking invoice as uncollectible:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to mark invoice as uncollectible",
          });
        }
      },
    });
  };

  const actionTemplate = (rowData) => {
    return (
      <>
        <Button
          icon="pi pi-file-pdf"
          className="p-button-rounded p-button-info p-mr-2"
          onClick={() => viewPdf(rowData)}
          tooltip="View PDF"
        />
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => finalizeInvoice(rowData)}
          tooltip="Finalize Invoice"
          disabled={rowData.status !== 'draft'}
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-mr-2"
          onClick={() => voidInvoice(rowData)}
          tooltip="Void Invoice"
          disabled={rowData.status === 'void' || rowData.status === 'uncollectible'}
        />
        <Button
          icon="pi pi-exclamation-triangle"
          className="p-button-rounded p-button-warning"
          onClick={() => markUncollectible(rowData)}
          tooltip="Mark as Uncollectible"
          disabled={rowData.status === 'void' || rowData.status === 'uncollectible'}
        />
      </>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <DataTable value={invoices} responsiveLayout="scroll">
        <Column field="id" header="Invoice ID" />
        <Column field="customerName" header="Customer Name" />
        <Column
          field="amount"
          header="Amount"
          body={(rowData) => `$${rowData.amount.toFixed(2)}`}
        />
        <Column field="status" header="Status" />
        <Column
          field="createdAt"
          header="Created At"
          body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
        />
        <Column body={actionTemplate} />
      </DataTable>
      <Dialog
        visible={showPdfDialog}
        onHide={() => setShowPdfDialog(false)}
        header="Invoice PDF"
        maximizable
        style={{ width: '80vw' }}
      >
        {selectedInvoice && (
          <iframe
            src={selectedInvoice.pdfUrl}
            title="Invoice PDF"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default InvoiceManagement;