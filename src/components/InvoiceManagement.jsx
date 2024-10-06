import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import useScreenSize from "../hooks/useScreenSize";
import {
  finalizeAndSendInvoice,
  voidInvoice,
  markUncollectible,
  viewPdf,
  fetchInvoices as fetchInvoicesUtil,
} from "../utils/invoiceUtils";

const InvoiceManagement = () => {
  const isMobile = useScreenSize();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const toast = useRef(null);
  const [loadingStates, setLoadingStates] = useState({});

  const fetchInvoices = useCallback(async () => {
    try {
      await fetchInvoicesUtil({}, setInvoices, () => {}, toast);
    } catch (error) {
      // Error handling is done in the utility function
    }
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const actionTemplate = (rowData) => {
    return (
      <>
        <Button
          icon="pi pi-file-pdf"
          className="p-button-rounded p-button-info p-mr-2"
          onClick={() =>
            viewPdf(
              rowData.id,
              setLoadingStates,
              (url) => setSelectedInvoice({ ...rowData, pdfUrl: url }),
              setShowPdfDialog,
              toast
            )
          }
          tooltip={isMobile ? null : "View PDF"}
          loading={loadingStates[`pdf_${rowData.id}`]}
        />
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() =>
            finalizeAndSendInvoice(
              rowData.id,
              toast,
              fetchInvoices,
              setLoadingStates
            )
          }
          tooltip={isMobile ? null : "Finalize Invoice"}
          disabled={rowData.status !== "draft"}
          loading={loadingStates[`finalize_${rowData.id}`]}
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-mr-2"
          onClick={() =>
            voidInvoice(rowData.id, toast, fetchInvoices, setLoadingStates)
          }
          tooltip={isMobile ? null : "Void Invoice"}
          disabled={
            rowData.status === "void" || rowData.status === "uncollectible"
          }
          loading={loadingStates[`void_${rowData.id}`]}
        />
        <Button
          icon="pi pi-exclamation-triangle"
          className="p-button-rounded p-button-warning"
          onClick={() =>
            markUncollectible(
              rowData.id,
              toast,
              fetchInvoices,
              setLoadingStates
            )
          }
          tooltip={isMobile ? null : "Mark as Uncollectible"}
          disabled={
            rowData.status === "void" || rowData.status === "uncollectible"
          }
          loading={loadingStates[`uncollectible_${rowData.id}`]}
        />
      </>
    );
  };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />
      {isMobile ? (
        // Mobile version
        <div className="invoice-management-mobile">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-item-mobile">
              <div>{invoice.id}</div>
              <div>{invoice.customerName}</div>
              <div>{`$${invoice.amount.toFixed(2)}`}</div>
              <div>{invoice.status}</div>
              <div>{new Date(invoice.createdAt).toLocaleString()}</div>
              <div className="invoice-actions-mobile">
                {actionTemplate(invoice)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop version
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
      )}
      <Dialog
        visible={showPdfDialog}
        onHide={() => setShowPdfDialog(false)}
        header="Invoice PDF"
        maximizable
        style={{ width: "80vw" }}
      >
        {selectedInvoice && (
          <iframe
            src={selectedInvoice.pdfUrl}
            title="Invoice PDF"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default InvoiceManagement;
