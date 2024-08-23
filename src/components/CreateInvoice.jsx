import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CreateInvoice = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [description, setDescription] = useState("");
  const toast = React.useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setEmailError("");
    setAmountError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (amount <= 0) {
      setAmountError("Amount must be greater than zero");
      return;
    }

    if (!user) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "You must be logged in to create an invoice",
      });
      return;
    }

    setLoading(true);
    try {
      const functions = getFunctions();
      const createInvoiceFunction = httpsCallable(functions, 'createInvoice');
      const result = await createInvoiceFunction({ email, amount, description });
      
      if (result.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Invoice created and sent successfully",
        });
        setEmail("");
        setAmount(0);
        setDescription("");
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      let errorMessage = "Failed to create and send invoice";
      if (error.code === 'resource-exhausted') {
        errorMessage = "Too many requests. Please try again later.";
      }
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Please log in to create invoices.</p>;
  }

  return (
    <form onSubmit={handleCreateInvoice} className="create-invoice">
      <Toast ref={toast} />
      <h2>Create Invoice</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Customer Email</label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "p-invalid" : ""}
          />
          {emailError && <small className="p-error">{emailError}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="amount">Amount (USD)</label>
          <InputNumber
            id="amount"
            value={amount}
            onValueChange={(e) => setAmount(e.value)}
            mode="currency"
            currency="USD"
            locale="en-US"
            className={amountError ? "p-invalid" : ""}
          />
          {amountError && <small className="p-error">{amountError}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" label="Send Invoice" loading={loading} />
      </div>
    </form>
  );
};

export default CreateInvoice;