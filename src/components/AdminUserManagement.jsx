import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = React.useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const functions = getFunctions();
    const listUsers = httpsCallable(functions, "listUsers");
    try {
      const result = await listUsers();
      setUsers(result.data.users);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid, role) => {
    const functions = getFunctions();
    const setUserRole = httpsCallable(functions, "setUserRole");
    try {
      await setUserRole({ uid, role });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Role updated successfully",
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update role",
      });
    }
  };

  const handleResendVerification = async (email) => {
    const auth = getAuth();
    try {
      const user = await auth.getUserByEmail(email);
      await sendEmailVerification(user);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Verification email sent",
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to send verification email",
      });
    }
  };

  const roleOptions = [
    { label: "User", value: "user" },
    { label: "Admin", value: "admin" },
    { label: "Superadmin", value: "superadmin" },
  ];

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      <Toast ref={toast} />
      <DataTable value={users} loading={loading}>
        <Column field="email" header="Email" />
        <Column
          field="role"
          header="Role"
          body={(rowData) => (
            <Dropdown
              value={rowData.role}
              options={roleOptions}
              onChange={(e) => handleRoleChange(rowData.uid, e.value)}
            />
          )}
        />
        <Column
          field="emailVerified"
          header="Email Verified"
          body={(rowData) => (rowData.emailVerified ? "Yes" : "No")}
        />
        <Column
          body={(rowData) => (
            <Button
              label="Resend Verification"
              onClick={() => handleResendVerification(rowData.email)}
              disabled={rowData.emailVerified}
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default AdminUserManagement;

