import React, { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAuth } from "./AuthContext";
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";
import { confirmDialog } from "primereact/confirmdialog";
import { Navigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Fieldset } from "primereact/fieldset";
import { services } from "./Home/services-list";
import "../css/invoice-form.css";
import Select from "react-select";

const InvoiceForm = ({ onInvoiceCreated }) => {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useRef(null);
  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [focusedPriceIndex, setFocusedPriceIndex] = useState(null);

  const serviceOptions = services.map((service) => ({
    label: service.title,
    value: service.title,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    confirmDialog({
      message: "Are you sure you want to create this invoice?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => createInvoice(),
    });
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    if (field === "price") {
      // Convert the value to cents
      updatedItems[index][field] = value ? Math.round(value * 100) : null;
    } else if (field === "description") {
      // Handle empty string for description
      updatedItems[index][field] = value || "";
    } else {
      updatedItems[index][field] = value;
    }
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const itemPrice = item.price !== null ? item.price : 0;
      return total + item.quantity * (itemPrice / 100);
    }, 0);
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setItems([{ description: "", quantity: 1, price: 0 }]);
  };

  const createInvoice = async () => {
    setLoading(true);
    try {
      const createDraftInvoiceFunction = httpsCallable(functions, "createDraftInvoice");
      const result = await createDraftInvoiceFunction({
        customerEmail,
        customerName,
        items: items.map((item) => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          unit_amount: item.price,
        })),
      });

      if (result.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Draft invoice created with ID: ${result.data.invoiceId}`,
          life: 5000,
        });
        resetForm();
        
        if (onInvoiceCreated) {
          onInvoiceCreated();
        }
      } else {
        throw new Error(result.data.error || "Failed to create draft invoice");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to create draft invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="invoice-form">
      <Toast ref={toast} position="top-right" />
      <Card title="Create Invoice" className="p-shadow-5">
        <form onSubmit={handleSubmit}>
          <div className="p-fluid">
            <Fieldset legend="Customer Information">
              <div className="p-field">
                <span className="p-float-label">
                  <InputText
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <label htmlFor="customerName">Customer Name</label>
                </span>
              </div>
              <div className="p-field">
                <span className="p-float-label">
                  <InputText
                    id="customerEmail"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="customerEmail">Customer Email</label>
                </span>
              </div>
            </Fieldset>

            <Fieldset legend="Invoice Items">
              {items.map((item, index) => (
                <div key={index} className="p-grid p-formgrid p-fluid p-mb-3">
                  <div className="p-col-12 p-mb-2">
                    <label htmlFor={`service-${index}`}>Select a Service</label>
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
                    />
                  </div>
                  <div className="p-col-6 p-mb-2">
                    <label htmlFor={`price-${index}`}>Price</label>
                    <InputNumber
                      id={`price-${index}`}
                      value={
                        focusedPriceIndex === index
                          ? null
                          : item.price !== null
                          ? item.price / 100
                          : null
                      }
                      onValueChange={(e) => updateItem(index, "price", e.value)}
                      onFocus={() => setFocusedPriceIndex(index)}
                      onBlur={() => setFocusedPriceIndex(null)}
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      minFractionDigits={2}
                      maxFractionDigits={2}
                      placeholder="$0.00"
                    />
                  </div>
                </div>
              ))}
              <div className="p-d-flex p-flex-column p-ai-center">
                <Button
                  type="button"
                  label="Add Item"
                  icon="pi pi-plus"
                  onClick={addItem}
                  className="p-button-secondary p-mb-2"
                />
                {items.length > 1 && (
                  <div className="delete-button">
                    <Button
                      type="button"
                      label="Delete Item"
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={() => removeItem(items.length - 1)}
                    />
                  </div>
                )}
              </div>
            </Fieldset>

            <Fieldset legend="Invoice Summary">
              <div className="p-d-flex p-jc-between">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              {/* <div className="p-d-flex p-jc-between p-mt-2">
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div> */}
              <div className="p-d-flex p-jc-between p-mt-2">
                <strong>Total:</strong>
                <strong>${calculateTotal().toFixed(2)}</strong>
              </div>
            </Fieldset>

            <div className="p-d-flex p-jc-center">
              <Button
                type="submit"
                label="Create Draft Invoice"
                icon="pi pi-file"
                loading={loading}
                className="p-button-lg"
              />
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InvoiceForm;