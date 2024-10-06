import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import ManageImages from "./ManageImages";
import AdminSettings from "./AdminSettings";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import { Toast } from "primereact/toast";
import "../css/admin.css";

const AdminPage = () => {
  const [activeIndex, setActiveIndex] = useState(() => {
    const savedIndex = localStorage.getItem("adminActiveTabIndex");
    return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  });;
  const toast = React.useRef(null);
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    localStorage.setItem("adminActiveTabIndex", activeIndex.toString());
  }, [activeIndex]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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
            <InvoiceForm onInvoiceCreated={triggerRefresh} />
          </TabPanel>
        </TabView>
      </div>
      {activeIndex === 2 ? (
        <InvoiceList refreshTrigger={refreshTrigger} />
      ) : null}
    </div>
  );
};

export default AdminPage;
