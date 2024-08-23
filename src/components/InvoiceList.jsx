import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { getFunctions, httpsCallable } from "firebase/functions";
import InvoiceDetails from './InvoiceDetails';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastCursor, setLastCursor] = useState(null);
  const toast = React.useRef(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const listInvoicesFunction = httpsCallable(functions, 'listInvoices');
      const result = await listInvoicesFunction({ 
        limit: lazyParams.rows, 
        cursor: lastCursor,
        sortField,
        sortOrder,
        filters
      });
      
      if (result.data.success) {
        setInvoices(result.data.invoices);
        setTotalRecords(result.data.totalCount);
        setLastCursor(result.data.lastCursor);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch invoices' });
    } finally {
      setLoading(false);
    }
  }, [lazyParams.rows, lastCursor, sortField, sortOrder, filters]);

  const onPage = (event) => {
    setLazyParams(event);
    if (event.page > lazyParams.page) {
      // Next page
      setLastCursor(invoices[invoices.length - 1].id);
    } else {
      // Previous page
      setLastCursor(null);
    }
  };

  const onSort = (event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    setLastCursor(null);
  };

  const onFilter = (event) => {
    setFilters(event.filters);
    setLastCursor(null);
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, lazyParams]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
  };

  const formatDate = (value) => {
    return new Date(value * 1000).toLocaleDateString();
  };

  const confirmDelete = (invoice) => {
    confirmDialog({
      message: 'Are you sure you want to void this invoice?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteInvoice(invoice.id),
    });
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      const functions = getFunctions();
      const deleteInvoiceFunction = httpsCallable(functions, 'deleteInvoice');
      const result = await deleteInvoiceFunction({ invoiceId });
      
      if (result.data.success) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Invoice voided successfully' });
        fetchInvoices();
      } else {
        throw new Error('Failed to void invoice');
      }
    } catch (error) {
      console.error("Error voiding invoice:", error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to void invoice' });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDelete(rowData)} />
    );
  };

  const showInvoiceDetails = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setDetailsVisible(true);
  };

  return (
    <div className="invoice-list">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2>Invoices</h2>
      <DataTable 
        value={invoices} 
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading} 
        responsiveLayout="scroll"
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={onSort}
        filters={filters}
        onFilter={onFilter}
      >
        <Column field="number" header="Invoice Number" sortable filter filterPlaceholder="Search by number"></Column>
        <Column field="amount_due" header="Amount Due" body={(rowData) => formatCurrency(rowData.amount_due)} sortable filter filterPlaceholder="Search by amount"></Column>
        <Column field="status" header="Status" sortable filter filterPlaceholder="Search by status"></Column>
        <Column field="created" header="Created Date" body={(rowData) => formatDate(rowData.created)} sortable filter filterPlaceholder="Search by date"></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
        <Column body={(rowData) => (
          <Button icon="pi pi-eye" className="p-button-rounded p-button-info" onClick={() => showInvoiceDetails(rowData.id)} />
        )} exportable={false} style={{ minWidth: '4rem' }}></Column>
      </DataTable>
      <InvoiceDetails
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
};

export default InvoiceList;