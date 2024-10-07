import React, { useState, useCallback, useRef } from "react";
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
import { Paginator } from "primereact/paginator";
import { ProgressSpinner } from "primereact/progressspinner";
import "../css/invoice-list.css";
import useScreenSize from "../hooks/useScreenSize";
import Select from "react-select";
import { services } from "./Home/services-list";
import {
  formatCurrency,
  statusOptions,
  isInvoiceEditable,
  finalizeAndSendInvoice,
  voidInvoice,
  markUncollectible,
  viewPdf,
  fetchInvoices,
} from "../utils/invoiceUtils";
import { clearInvoiceCache } from "../utils/secureStorage";

const InvoiceList = ({
  invoices,
  totalRecords,
  loading,
  setLoading,
  lazyParams,
  setLazyParams,
  loadLazyData,
  invalidateCache,
  setInvoices,
  setTotalRecords,
}) => {
  const isMobile = useScreenSize();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const toast = useRef(null);

  const [pdfDialogVisible, setPdfDialogVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [paymentLinkDialogVisible, setPaymentLinkDialogVisible] =
    useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [loadingStates, setLoadingStates] = useState({});

  const [editableCustomer, setEditableCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableInvoiceItems, setEditableInvoiceItems] = useState([]);
  const [focusedPriceIndex, setFocusedPriceIndex] = useState(null);

  const [manualSyncLoading, setManualSyncLoading] = useState(false);

  const serviceOptions = services.map((service) => ({
    label: service.title,
    value: service.title,
  }));

  const invoiceListTopRef = useRef(null);

  const scrollToInvoice = useCallback(() => {
    if (invoiceListTopRef.current) {
      const yOffset = -80; // Adjust this value as needed
      const element = invoiceListTopRef.current;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  }, []);

  const onPage = (event) => {
    requestAnimationFrame(() => {
      scrollToInvoice();
    });

    setLoading(true);
    setLazyParams((prevParams) => ({
      ...prevParams,
      first: event.first,
      page: event.page + 1,
      rows: event.rows,
    }));

    fetchInvoices(
      {
        page: event.page + 1,
        pageSize: event.rows,
        status: lazyParams.status,
      },
      setInvoices,
      setTotalRecords,
      toast
    )
      .catch((error) => {
        console.error("Error syncing page data:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch next page.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFilter = (value) => {
    setLazyParams({
      ...lazyParams,
      first: 0,
      page: 1,
      status: value,
    });
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`invoice-status invoice-status-${rowData.status}`}>
        {rowData.status}
      </span>
    );
  };

  const handleManualSync = () => {
    confirmDialog({
      message: (
        <>
          <p>Are you sure you want to perform a manual sync?</p>
          <p
            style={{
              color: "red",
              fontSize: "0.9em",
              marginTop: "10px",
            }}
          >
            Warning: You can only preform this action a limited number of times
            before being temporarily locked out.
          </p>
        </>
      ),
      header: "Manual Sync Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        setManualSyncLoading(true);
        try {
          const manualSyncInvoices = httpsCallable(
            functions,
            "manualSyncInvoices"
          );
          const result = await manualSyncInvoices();
          if (result.data.success) {
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: `Synced ${result.data.count} invoices`,
            });
            invalidateCache();
          }
        } catch (error) {
          console.error("Error syncing invoices:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to sync invoices: " + error.message,
          });
        } finally {
          setManualSyncLoading(false);
        }
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Manual sync cancelled",
        });
      },
    });
  };

  const viewPaymentPage = async (invoiceId) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [`payment_${invoiceId}`]: true }));
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
      setLoadingStates((prev) => ({
        ...prev,
        [`payment_${invoiceId}`]: false,
      }));
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
          setLoadingStates((prev) => ({
            ...prev,
            [`delete_${invoiceId}`]: true,
          }));
          const deleteInvoiceFunction = httpsCallable(
            functions,
            "deleteInvoice"
          );
          await deleteInvoiceFunction({ invoiceId });
          clearInvoiceCache(); // Add this line
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Invoice deleted successfully",
          });
          invalidateCache();
        } catch (error) {
          console.error("Error deleting invoice:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete invoice: " + error.message,
          });
        } finally {
          setLoadingStates((prev) => ({
            ...prev,
            [`delete_${invoiceId}`]: false,
          }));
          resetDialog();
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

  const handleFinalizeAndSendInvoice = (invoiceId) => {
    confirmDialog({
      message: "Are you sure you want to finalize and send this invoice?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        finalizeAndSendInvoice(
          invoiceId,
          toast,
          invalidateCache,
          setLoadingStates,
          resetDialog
        );
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Invoice finalization cancelled",
        });
      },
    });
  };

  const handleVoidInvoice = (invoiceId) => {
    confirmDialog({
      message: "Are you sure you want to void this invoice?",
      header: "Void Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        voidInvoice(
          invoiceId,
          toast,
          invalidateCache,
          setLoadingStates,
          resetDialog
        );
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Invoice void cancelled",
        });
      },
    });
  };

  const handleMarkUncollectible = (invoiceId) => {
    confirmDialog({
      message: "Are you sure you want to mark this invoice as uncollectible?",
      header: "Mark Uncollectible Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        markUncollectible(
          invoiceId,
          toast,
          invalidateCache,
          setLoadingStates,
          resetDialog
        );
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Mark uncollectible cancelled",
        });
      },
    });
  };

  const actionBodyTemplate = (rowData) => {
    const isAnyActionLoading = Object.keys(loadingStates).some(
      (key) => key.includes(rowData.id) && loadingStates[key]
    );

    return (
      <div className="invoice-actions">
        {rowData.status === "draft" && (
          <>
            <Button
              icon="pi pi-send"
              className="p-button-rounded p-button-success"
              onClick={() => handleFinalizeAndSendInvoice(rowData.id)}
              tooltip={isMobile ? null : "Finalize and Send"}
              loading={loadingStates[`finalize_${rowData.id}`]}
              disabled={isAnyActionLoading}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteInvoice(rowData.id)}
              tooltip={isMobile ? null : "Delete"}
              loading={loadingStates[`delete_${rowData.id}`]}
              disabled={isAnyActionLoading}
            />
          </>
        )}
        {rowData.status === "open" && (
          <>
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-warning"
              onClick={() => handleVoidInvoice(rowData.id)}
              tooltip={isMobile ? null : "Void"}
              disabled={
                isAnyActionLoading ||
                rowData.status === "void" ||
                rowData.status === "uncollectible"
              }
              loading={loadingStates[`void_${rowData.id}`]}
            />
            <Button
              icon="pi pi-exclamation-triangle"
              className="p-button-rounded p-button-danger"
              onClick={() => handleMarkUncollectible(rowData.id)}
              tooltip={isMobile ? null : "Mark Uncollectible"}
              disabled={
                isAnyActionLoading ||
                rowData.status === "void" ||
                rowData.status === "uncollectible"
              }
              loading={loadingStates[`uncollectible_${rowData.id}`]}
            />
            <Button
              icon="pi pi-dollar"
              className="p-button-rounded p-button-success"
              onClick={() => viewPaymentPage(rowData.id)}
              tooltip={isMobile ? null : "View Payment Page"}
              loading={loadingStates[`payment_${rowData.id}`]}
              disabled={isAnyActionLoading}
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
            onClick={() =>
              viewPdf(
                rowData.id,
                setLoadingStates,
                setPdfUrl,
                setPdfDialogVisible,
                toast
              )
            }
            tooltip={isMobile ? null : "View PDF"}
            loading={loadingStates[`pdf_${rowData.id}`]}
            disabled={isAnyActionLoading}
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
        unit_amount: item.unit_amount || item.amount,
        quantity: item.quantity || 1,
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
        clearInvoiceCache(); // Add this line
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
        invalidateCache();
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
      resetDialog();
    }
  };

  const deleteItem = async (index) => {
    const itemToDelete = editableInvoiceItems[index];
    if (itemToDelete.id) {
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
          const updatedItems = editableInvoiceItems.filter(
            (_, i) => i !== index
          );
          setEditableInvoiceItems(updatedItems);
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
      const updatedItems = editableInvoiceItems.filter((_, i) => i !== index);
      setEditableInvoiceItems(updatedItems);
    }
  };

  const addItem = () => {
    setEditableInvoiceItems([
      ...editableInvoiceItems,
      { description: "", unit_amount: 0, quantity: 1 },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...editableInvoiceItems];
    if (field === "unit_amount") {
      updatedItems[index][field] = value ? Math.round(value * 100) : null;
    } else if (field === "description") {
      updatedItems[index][field] = value || "";
    } else {
      updatedItems[index][field] = value;
    }
    setEditableInvoiceItems(updatedItems);
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

  const resetDialog = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerDialogVisible(false);
  }, []);

  return (
    <div ref={invoiceListTopRef}>
      <div className="invoice-list-container">
        <h2>Invoices</h2>
        <Toast ref={toast} position="top-right" />
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
            loading={manualSyncLoading}
            className="p-button-secondary invoice-sync-button"
          />
        </div>
        {isMobile ? (
          // Mobile version
          <div className="invoice-list-mobile">
            {loading ? (
              <div className="loading-spinner">
                <ProgressSpinner />
              </div>
            ) : (
              <>
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="invoice-item-mobile">
                    <div className="customer-status-container">
                      <div
                        onClick={() => onCustomerSelect(invoice)}
                        className="customer-name"
                      >
                        {invoice.customerName}
                      </div>
                      <div
                        className={`invoice-status invoice-status-${invoice.status}`}
                      >
                        {invoice.status}
                      </div>
                    </div>
                    <div>{invoice.customerEmail}</div>
                    <div>{formatCurrency(invoice.amount)}</div>
                    <div className="invoice-actions-mobile">
                      {actionBodyTemplate(invoice)}
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="no-invoices-message">No invoices found</div>
                )}
                <Paginator
                  first={lazyParams.first}
                  rows={lazyParams.rows}
                  totalRecords={totalRecords}
                  onPageChange={onPage}
                  template="PrevPageLink PageLinks NextPageLink"
                />
              </>
            )}
          </div>
        ) : (
          // Desktop version
          <DataTable
            value={invoices}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            loading={loading}
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
            <Column
              field="actions"
              header="Actions"
              body={actionBodyTemplate}
            />
          </DataTable>
        )}

        <Dialog
          header="Customer Details"
          visible={customerDialogVisible}
          style={{ width: "80vw", maxWidth: "800px" }}
          onHide={() => {
            setCustomerDialogVisible(false);
            setIsEditing(false);
          }}
          className="customer-details-dialog"
        >
          {selectedCustomer && (
            <div>
              {isEditing ? (
                <div className="p-fluid p-dialog-content">
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
                    <div key={item.id || index} className="invoice-item">
                      <div className="p-grid p-formgrid p-fluid">
                        <div className="p-col-12 p-mb-2">
                          <label htmlFor={`service-${index}`}>
                            Select a Service
                          </label>
                          <Select
                            id={`service-${index}`}
                            value={
                              serviceOptions.find(
                                (option) => option.value === item.description
                              ) || null
                            }
                            options={serviceOptions}
                            onChange={(selectedOption) =>
                              updateItem(
                                index,
                                "description",
                                selectedOption ? selectedOption.value : ""
                              )
                            }
                            placeholder="Select a Service"
                            isClearable
                            isSearchable
                            isDisabled={
                              !isInvoiceEditable(selectedCustomer.status)
                            }
                          />
                        </div>
                        <div className="p-col-6 p-mb-2">
                          <label htmlFor={`quantity-${index}`}>Quantity</label>
                          <InputNumber
                            id={`quantity-${index}`}
                            value={item.quantity}
                            onValueChange={(e) =>
                              updateItem(index, "quantity", e.value)
                            }
                            min={1}
                            showButtons
                            buttonLayout="horizontal"
                            decrementButtonClassName="p-button-secondary"
                            incrementButtonClassName="p-button-secondary"
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus"
                            disabled={
                              !isInvoiceEditable(selectedCustomer.status)
                            }
                          />
                        </div>
                        <div className="p-col-6 p-mb-2">
                          <label htmlFor={`price-${index}`}>Price</label>
                          <InputNumber
                            id={`price-${index}`}
                            value={
                              focusedPriceIndex === index
                                ? null
                                : item.unit_amount !== null
                                ? item.unit_amount / 100
                                : null
                            }
                            onValueChange={(e) =>
                              updateItem(index, "unit_amount", e.value)
                            }
                            onFocus={() => setFocusedPriceIndex(index)}
                            onBlur={() => setFocusedPriceIndex(null)}
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            placeholder="$0.00"
                            disabled={
                              !isInvoiceEditable(selectedCustomer.status)
                            }
                          />
                        </div>
                      </div>
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
                    onClick={addItem}
                    className="p-button-secondary p-mb-3"
                    disabled={!isInvoiceEditable(selectedCustomer.status)}
                  />
                  <div className="p-d-flex p-jc-between">
                    <Button
                      label="Save Changes"
                      icon="pi pi-check"
                      onClick={handleCustomerUpdate}
                      loading={loading}
                      disabled={!isInvoiceEditable(selectedCustomer.status)}
                    />
                    <Button
                      label="Cancel"
                      icon="pi pi-times"
                      onClick={() => setIsEditing(false)}
                      className="p-button-secondary"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {isInvoiceEditable(selectedCustomer.status) && (
                    <Button
                      label="Edit Customer"
                      icon="pi pi-pencil"
                      onClick={() => setIsEditing(true)}
                      className="p-button-text p-mb-3"
                    />
                  )}
                  <div className="p-grid">
                    <div className="p-col-12 p-md-6">
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
                    </div>
                    <div className="p-col-12 p-md-6">
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
                    </div>
                  </div>
                  <h3>Invoice Items</h3>
                  {selectedCustomer.invoiceItems &&
                    selectedCustomer.invoiceItems.map((item) => (
                      <div key={item.id} className="p-grid p-mb-2">
                        <div className="p-col-12 p-md-6">
                          <strong>Description:</strong> {item.description}
                        </div>
                        <div className="p-col-4 p-md-2">
                          <strong>Unit Amount:</strong>{" "}
                          {formatCurrency(item.unit_amount)}
                        </div>
                        <div className="p-col-4 p-md-2">
                          <strong>Quantity:</strong> {item.quantity}
                        </div>
                        <div className="p-col-4 p-md-2">
                          <strong>Total:</strong>{" "}
                          {formatCurrency(item.unit_amount * item.quantity)}
                        </div>
                      </div>
                    ))}
                  <h3>Actions</h3>
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
            <div className="payment-link-container">
              <p>Payment link:</p>
              <InputText
                value={paymentLink}
                readOnly
                className="payment-link-box"
              />
            </div>
          }
          header="Invoice Payment Link"
          icon="pi pi-exclamation-triangle"
          accept={openInNewWindow}
          reject={copyToClipboard}
          acceptLabel="Open in New Window"
          rejectLabel="Copy to Clipboard"
          className="payment-link-dialog"
        />
      </div>
    </div>
  );
};

export default InvoiceList;
