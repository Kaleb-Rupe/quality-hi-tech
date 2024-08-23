import React, { useState, useCallback, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { getFunctions, httpsCallable } from "firebase/functions";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY_PROD);

const InvoiceDetails = ({ visible, onHide, invoiceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState({});
  const toast = React.useRef(null);

  const fetchInvoiceDetails = useCallback(async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const getInvoiceDetailsFunction = httpsCallable(functions, "getInvoiceDetails");
      const result = await getInvoiceDetailsFunction({ invoiceId });

      if (result.data.success) {
        setInvoice(result.data.invoice);
      } else {
        throw new Error("Failed to fetch invoice details");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch invoice details",
      });
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (visible && invoiceId) {
      fetchInvoiceDetails();
    }
  }, [visible, invoiceId, fetchInvoiceDetails]);

  const validatePaymentForm = () => {
    const newErrors = {};
    if (!cardNumber.match(/^\d{16}$/)) newErrors.cardNumber = "Invalid card number";
    if (!expMonth.match(/^(0[1-9]|1[0-2])$/)) newErrors.expMonth = "Invalid expiration month";
    if (!expYear.match(/^\d{4}$/)) newErrors.expYear = "Invalid expiration year";
    if (!cvc.match(/^\d{3,4}$/)) newErrors.cvc = "Invalid CVC";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;

    setPaymentLoading(true);
    try {
      const stripe = await stripePromise;
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cvc: cvc,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const functions = getFunctions();
      const processPaymentFunction = httpsCallable(functions, 'processPayment');
      const result = await processPaymentFunction({ invoiceId, paymentMethodId: paymentMethod.id });

      if (result.data.success) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Payment processed successfully' });
        fetchInvoiceDetails();
      } else {
        throw new Error('Failed to process payment');
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Failed to process payment' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
  };

  const formatDate = (value) => {
    return new Date(value * 1000).toLocaleDateString();
  };

  return (
    <Dialog header="Invoice Details" visible={visible} onHide={onHide} style={{ width: '50vw' }}>
      <Toast ref={toast} />
      {loading ? (
        <p>Loading invoice details...</p>
      ) : invoice ? (
        <div>
          <p><strong>Invoice Number:</strong> {invoice.number}</p>
          <p><strong>Amount Due:</strong> {formatCurrency(invoice.amount_due)}</p>
          <p><strong>Status:</strong> {invoice.status}</p>
          <p><strong>Created Date:</strong> {formatDate(invoice.created)}</p>
          <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
          <p><strong>Customer Email:</strong> {invoice.customer_email}</p>
          {invoice.status === 'open' && (
            <div className="payment-form">
              <h3>Payment Information</h3>
              <div className="p-field">
                <label htmlFor="cardNumber">Card Number</label>
                <InputText id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={errors.cardNumber ? "p-invalid" : ""} />
                {errors.cardNumber && <small className="p-error">{errors.cardNumber}</small>}
              </div>
              <div className="p-field">
                <label htmlFor="expMonth">Expiration Month (MM)</label>
                <InputText id="expMonth" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} className={errors.expMonth ? "p-invalid" : ""} />
                {errors.expMonth && <small className="p-error">{errors.expMonth}</small>}
              </div>
              <div className="p-field">
                <label htmlFor="expYear">Expiration Year (YYYY)</label>
                <InputText id="expYear" value={expYear} onChange={(e) => setExpYear(e.target.value)} className={errors.expYear ? "p-invalid" : ""} />
                {errors.expYear && <small className="p-error">{errors.expYear}</small>}
              </div>
              <div className="p-field">
                <label htmlFor="cvc">CVC</label>
                <InputText id="cvc" value={cvc} onChange={(e) => setCvc(e.target.value)} className={errors.cvc ? "p-invalid" : ""} />
                {errors.cvc && <small className="p-error">{errors.cvc}</small>}
              </div>
              <Button label="Pay Now" onClick={handlePayment} loading={paymentLoading} disabled={paymentLoading} />
            </div>
          )}
          <Button label="Close" onClick={onHide} className="p-button-secondary" style={{ marginLeft: '10px' }} />
        </div>
      ) : (
        <p>No invoice details available.</p>
      )}
    </Dialog>
  );
};

export default InvoiceDetails;