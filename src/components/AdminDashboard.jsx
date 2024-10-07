import React, { useState, useEffect, useCallback, useRef } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import ManageImages from "./ManageImages";
import AdminSettings from "./AdminSettings";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import { Toast } from "primereact/toast";
import "../css/admin.css";
import { clearInvoiceCache } from "../utils/secureStorage";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";

const AdminPage = () => {
  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("adminActiveTabIndex");
    return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  });
  const toast = useRef(null);
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 20,
    page: 1,
    status: null,
  });

  const loadLazyData = useCallback(() => {
    if (!user || !user.isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const listInvoices = httpsCallable(functions, "listInvoices");
    listInvoices(lazyParams)
      .then((result) => {
        const invoicesWithItems = result.data.invoices.map((invoice) => ({
          ...invoice,
          invoiceItems: invoice.invoiceItems || [],
        }));
        setInvoices(invoicesWithItems);
        setTotalRecords(result.data.totalCount);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch invoices: " + error.message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lazyParams, user]);

  useEffect(() => {
    loadLazyData();
  }, [loadLazyData]);

  useEffect(() => {
    localStorage.setItem("adminActiveTabIndex", activeIndex.toString());
  }, [activeIndex]);

  const invalidateCache = useCallback(() => {
    clearInvoiceCache();
    loadLazyData();
  }, [loadLazyData]);

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-page">
      <div className="admin-dashboard">
        <Toast ref={toast} position="top-right" />
        <h2>Admin Dashboard</h2>
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          <TabPanel header="Images">
            <ManageImages />
          </TabPanel>
          <TabPanel header="Settings">
            <AdminSettings />
          </TabPanel>
          <TabPanel header="Invoices">
            <InvoiceForm onInvoiceCreated={invalidateCache} />
          </TabPanel>
        </TabView>
      </div>
      {activeIndex === 2 ? (
        <InvoiceList
          invoices={invoices}
          totalRecords={totalRecords}
          loading={loading}
          setLoading={setLoading}
          lazyParams={lazyParams}
          setLazyParams={setLazyParams}
          loadLazyData={loadLazyData}
          invalidateCache={invalidateCache}
          setInvoices={setInvoices}
          setTotalRecords={setTotalRecords}
        />
      ) : null}
    </div>
  );
};

export default AdminPage;