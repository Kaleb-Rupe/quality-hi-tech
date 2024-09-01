import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';

const InvoiceForm = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createInvoice = httpsCallable(functions, 'createInvoice');
      const result = await createInvoice({ customerEmail, customerName, amount, description });

      if (result.data.success) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: `Invoice created with ID: ${result.data.invoiceId}` });
        // Reset form
        setCustomerEmail('');
        setCustomerName('');
        setAmount(0);
        setDescription('');
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create invoice' });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-field">
            <label htmlFor="amount">Amount (USD)</label>
            <InputNumber
              id="amount"
              value={amount}
              onValueChange={(e) => setAmount(e.value)}
              mode="currency"
              currency="USD"
              locale="en-US"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button type="submit" label="Create Invoice" loading={loading} />
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;