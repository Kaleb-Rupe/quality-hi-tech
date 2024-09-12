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
import { TextField } from "@mui/material";

const InvoiceForm = () => {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useRef(null);
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }]);

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
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const createInvoice = async () => {
    setLoading(true);
    try {
      const createDraftInvoiceFunction = httpsCallable(
        functions,
        "createDraftInvoice"
      );
      const result = await createDraftInvoiceFunction({
        customerEmail,
        customerName,
        items: items.map((item) => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
        })),
      });

      if (result.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Draft invoice created with ID: ${result.data.invoiceId}`,
          life: 5000,
        });
        // Reset form
        setCustomerEmail("");
        setCustomerName("");
        setItems([{ description: "", quantity: 1, price: 0 }]);
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
      <Toast ref={toast} />
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="customerEmail">Customer Email</label>
            <InputText
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="customerName">Customer Name</label>
            <InputText
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <h3>Invoice Items</h3>
          {items.map((item, index) => (
            <div key={index} className="p-grid p-fluid">
              <div className="p-col-6">
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  fullWidth
                />
              </div>
              <div className="p-col-2">
                <InputNumber
                  value={item.quantity}
                  onValueChange={(e) => updateItem(index, "quantity", e.value)}
                  min={1}
                />
              </div>
              <div className="p-col-3">
                <InputNumber
                  value={item.price}
                  onValueChange={(e) => updateItem(index, "price", e.value)}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                />
              </div>
              <div className="p-col-1">
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger"
                  onClick={() => removeItem(index)}
                />
              </div>
            </div>
          ))}
          <Button type="button" label="Add Item" icon="pi pi-plus" onClick={addItem} />
          <div className="p-field">
            <h3>Total: ${calculateTotal().toFixed(2)}</h3>
          </div>
          <Button type="submit" label="Create Draft Invoice" loading={loading} />
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
