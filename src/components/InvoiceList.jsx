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
import { ConfirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import "../css/invoice-list.css";

const InvoiceList = ({ refreshTrigger }) => {
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
  const [pdfLoading, setPdfLoading] = useState({});

  const [paymentLinkDialogVisible, setPaymentLinkDialogVisible] =
    useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [loadingStates, setLoadingStates] = useState({});

  const [editableCustomer, setEditableCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableInvoiceItems, setEditableInvoiceItems] = useState([]);

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
        // Ensure invoiceItems are included in the invoice data
        const invoicesWithItems = result.data.invoices.map((invoice) => ({
          ...invoice,
          invoiceItems: invoice.invoiceItems || [],
        }));
        setInvoices(invoicesWithItems);
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
  }, [loadLazyData, refreshTrigger]);

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
    confirmDialog({
      message: "Are you sure you want to finalize and send this invoice?",
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          setLoading(true);
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
            loadLazyData(); // Refresh the invoice list
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
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const viewPdf = async (invoiceId) => {
    try {
      setPdfLoading((prev) => ({ ...prev, [invoiceId]: true }));
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
      setPdfLoading((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const viewPaymentPage = async (invoiceId) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [invoiceId]: true }));
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
      setLoadingStates((prev) => ({ ...prev, [invoiceId]: false }));
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
    confirmDialog({
      message: "Are you sure you want to mark this invoice as uncollectible?",
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          setLoading(true);
          const markUncollectibleFunction = httpsCallable(
            functions,
            "markInvoiceUncollectible"
          );
          const result = await markUncollectibleFunction({ invoiceId });
          if (result.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: result.data.message,
            });
            loadLazyData(); // Refresh the invoice list
          } else {
            throw new Error(
              result.data.message || "Failed to mark invoice as uncollectible"
            );
          }
        } catch (error) {
          console.error("Error marking invoice as uncollectible:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to mark invoice as uncollectible: " + error.message,
          });
        } finally {
          setLoading(false);
        }
      },
    });
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
            <Button
              icon="pi pi-dollar"
              className="p-button-rounded p-button-success"
              onClick={() => viewPaymentPage(rowData.id)}
              tooltip="View Payment Page"
              loading={loadingStates[rowData.id]}
            />
          </>
        )}
        {(rowData.status === "open" ||
          rowData.status === "void" ||
          rowData.status === "paid" ||
          rowData.status === "uncollectible") && (
          <Button
            icon="pi pi-file-pdf"
            className="p-button-rounded p-button-info"
            onClick={() => viewPdf(rowData.id)}
            tooltip="View PDF"
            loading={pdfLoading[rowData.id]}
          />
        )}
      </div>
    );
  };

  const onCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setEditableCustomer({
      name: customer.customerName,
      email: customer.customerEmail,
    });
    setEditableInvoiceItems(
      customer.invoiceItems.map((item) => ({
        ...item,
        unit_amount: item.unit_amount || item.amount, // Handle both cases
        quantity: item.quantity || 1, // Ensure quantity is set
      })) || []
    );
    setIsEditing(false);
    setCustomerDialogVisible(true);
  };

  const handleCustomerUpdate = async () => {
    try {
      setLoading(true);
      const updateInvoiceAndItemsFunction = httpsCallable(
        functions,
        "updateInvoiceAndItems"
      );
      const result = await updateInvoiceAndItemsFunction({
        invoiceId: selectedCustomer.id,
        customerData: editableCustomer,
        invoiceItemUpdates: editableInvoiceItems.map((item) => ({
          id: item.id,
          description: item.description,
          unit_amount: Math.round(item.unit_amount), // Ensure it's in cents
          quantity: item.quantity,
          deleted: item.deleted,
        })),
      });

      if (result.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Invoice and items updated successfully",
        });
        setIsEditing(false);
        const updatedInvoiceItems = result.data.updatedInvoiceItems.map(
          (item) => ({
            ...item,
            unit_amount: item.unit_amount,
            quantity: item.quantity,
          })
        );
        setSelectedCustomer({
          ...selectedCustomer,
          customerName: editableCustomer.name,
          customerEmail: editableCustomer.email,
          amount: result.data.updatedAmount,
          invoiceItems: updatedInvoiceItems,
        });
        setEditableInvoiceItems(updatedInvoiceItems);
        loadLazyData(); // Refresh the invoice list
      } else {
        throw new Error(
          result.data.message || "Failed to update invoice and items"
        );
      }
    } catch (error) {
      console.error("Error updating invoice and items:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update invoice and items: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (index) => {
    const itemToDelete = editableInvoiceItems[index];
    if (itemToDelete.id) {
      // If the item has an ID, call the deleteInvoiceItem function
      try {
        setLoading(true);
        const deleteInvoiceItemFunction = httpsCallable(
          functions,
          "deleteInvoiceItem"
        );
        const result = await deleteInvoiceItemFunction({
          invoiceId: selectedCustomer.id,
          itemId: itemToDelete.id,
        });
        if (result.data.success) {
          setEditableInvoiceItems(result.data.updatedInvoiceItems);
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Invoice item deleted successfully",
          });
        }
      } catch (error) {
        console.error("Error deleting invoice item:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete invoice item: " + error.message,
        });
      } finally {
        setLoading(false);
      }
    } else {
      // If it's a new item, just remove it from the array
      const newItems = [...editableInvoiceItems];
      newItems.splice(index, 1);
      setEditableInvoiceItems(newItems);
    }
  };

  // Add this function to check if the invoice is editable
  const isInvoiceEditable = (status) => {
    return status === "draft";
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
        onHide={() => {
          setCustomerDialogVisible(false);
          setIsEditing(false);
        }}
      >
        {selectedCustomer && (
          <div>
            {isEditing ? (
              <div>
                <div className="p-field">
                  <label htmlFor="customerName">Name</label>
                  <InputText
                    id="customerName"
                    value={editableCustomer.name}
                    onChange={(e) =>
                      setEditableCustomer({
                        ...editableCustomer,
                        name: e.target.value,
                      })
                    }
                    disabled={!isInvoiceEditable(selectedCustomer.status)}
                  />
                </div>
                <div className="p-field">
                  <label htmlFor="customerEmail">Email</label>
                  <InputText
                    id="customerEmail"
                    value={editableCustomer.email}
                    onChange={(e) =>
                      setEditableCustomer({
                        ...editableCustomer,
                        email: e.target.value,
                      })
                    }
                    disabled={!isInvoiceEditable(selectedCustomer.status)}
                  />
                </div>
                <h3>Invoice Items</h3>
                {editableInvoiceItems.map((item, index) => (
                  <div key={item.id || index} className="p-field">
                    <InputText
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...editableInvoiceItems];
                        newItems[index].description = e.target.value;
                        setEditableInvoiceItems(newItems);
                      }}
                      placeholder="Description"
                      disabled={!isInvoiceEditable(selectedCustomer.status)}
                    />
                    <InputNumber
                      value={item.unit_amount / 100}
                      onValueChange={(e) => {
                        const newItems = [...editableInvoiceItems];
                        newItems[index].unit_amount = e.value * 100;
                        setEditableInvoiceItems(newItems);
                      }}
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      disabled={!isInvoiceEditable(selectedCustomer.status)}
                    />
                    <InputNumber
                      value={item.quantity}
                      onValueChange={(e) => {
                        const newItems = [...editableInvoiceItems];
                        newItems[index].quantity = e.value;
                        setEditableInvoiceItems(newItems);
                      }}
                      min={1}
                      placeholder="Quantity"
                      disabled={!isInvoiceEditable(selectedCustomer.status)}
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger p-button-rounded"
                      onClick={() => deleteItem(index)}
                      disabled={!isInvoiceEditable(selectedCustomer.status)}
                    />
                  </div>
                ))}
                <Button
                  label="Add Item"
                  icon="pi pi-plus"
                  onClick={() => {
                    setEditableInvoiceItems([
                      ...editableInvoiceItems,
                      { description: "", unit_amount: 0, quantity: 1 },
                    ]);
                  }}
                  className="p-button-secondary"
                  disabled={!isInvoiceEditable(selectedCustomer.status)}
                />
                <Button
                  label="Save Changes"
                  onClick={handleCustomerUpdate}
                  loading={loading}
                  disabled={!isInvoiceEditable(selectedCustomer.status)}
                />
                <Button
                  label="Cancel"
                  onClick={() => setIsEditing(false)}
                  className="p-button-secondary"
                  style={{ marginLeft: "10px" }}
                />
              </div>
            ) : (
              <div>
                {isInvoiceEditable(selectedCustomer.status) && (
                  <Button
                    label="Edit Customer"
                    icon="pi pi-pencil"
                    onClick={() => setIsEditing(true)}
                    className="p-button-text"
                  />
                )}
                <p>
                  <strong>Name:</strong> {selectedCustomer.customerName}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${selectedCustomer.customerEmail}`}>
                    {selectedCustomer.customerEmail}
                  </a>
                </p>
                <p>
                  <strong>Invoice ID:</strong> {selectedCustomer.id}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {formatCurrency(selectedCustomer.amount)}
                </p>
                <p>
                  <strong>Status:</strong> {selectedCustomer.status}
                </p>
                <p>
                  <strong>Due Date:</strong>{" "}
                  {selectedCustomer.dueDate
                    ? new Date(
                        selectedCustomer.dueDate.seconds * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {selectedCustomer.created
                    ? new Date(
                        selectedCustomer.created.seconds * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <h3>Invoice Items</h3>
                {selectedCustomer.invoiceItems &&
                  selectedCustomer.invoiceItems.map((item) => (
                    <div key={item.id}>
                      <p>
                        <strong>Description:</strong> {item.description}
                      </p>
                      <p>
                        <strong>Unit Amount:</strong>
                        {formatCurrency(item.unit_amount)}
                      </p>
                      <p>
                        <strong>Total Amount:</strong>
                        {formatCurrency(item.unit_amount * item.quantity)}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                    </div>
                  ))}
                <p>
                  <strong>Actions:</strong>
                </p>
                <div className="invoice-actions">
                  {actionBodyTemplate(selectedCustomer)}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        header="Invoice PDF"
        visible={pdfDialogVisible}
        style={{ width: "80vw" }}
        onHide={() => setPdfDialogVisible(false)}
      >
        {pdfUrl ? (
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
