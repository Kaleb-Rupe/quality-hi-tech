import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const toast = useRef(null);
  const functions = getFunctions();
  const auth = getAuth();

 

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Calling listUsers function");
      const listUsers = httpsCallable(functions, "listUsers");
      const result = await listUsers();
      console.log("listUsers result:", result.data);
      setUsers(result.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to fetch users: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [functions]);

   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
       setCurrentUser(user);
       setAuthChecked(true);
       if (user) {
         fetchUsers();
       } else {
         setLoading(false);
       }
     });

     return () => unsubscribe();
   }, [auth, fetchUsers]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8 || password.length > 15) {
      errors.push("Password length should be between 8 to 15 characters.");
    }
    if (!/\d/.test(password)) {
      errors.push("Password should contain at least one digit (0-9).");
    }
    if (!/[a-z]/.test(password)) {
      errors.push(
        "Password should contain at least one lowercase letter (a-z)."
      );
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(
        "Password should contain at least one uppercase letter (A-Z)."
      );
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push(
        "Password should contain at least one special character (@, #, %, &, !, $, etc)."
      );
    }
    if (/\s/.test(password)) {
      errors.push("Password should not contain any space.");
    }
    return errors;
  };

  const handleEditUser = (user) => {
    setEditingUser({
      uid: user.uid,
      firstName: user.displayName ? user.displayName.split(" ")[0] : "",
      lastName: user.displayName ? user.displayName.split(" ")[1] : "",
      email: user.email,
      password: "",
      confirmPassword: "",
    });
    setShowDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordErrors(validatePassword(value));
    }
  };

  const createAdminUser = async () => {
    if (editingUser.password !== editingUser.confirmPassword) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Passwords do not match",
      });
      return;
    }

    if (passwordErrors.length > 0) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please fix all password errors before submitting",
      });
      return;
    }

    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        editingUser.email,
        editingUser.password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Set admin claim using Cloud Function
      const setAdminClaim = httpsCallable(functions, "setAdminClaim");
      await setAdminClaim({ uid: user.uid });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail:
          "Admin user created successfully. A verification email has been sent.",
        life: 5000,
      });
      setShowDialog(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to create admin user: ${error.message}`,
        life: 5000,
      });
    }
  };

  const resendVerificationEmail = async (user) => {
    if (!currentUser) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "You must be logged in to perform this action.",
        life: 5000,
      });
      return;
    }

    try {
      if (currentUser.email === user.email) {
        await sendEmailVerification(currentUser);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Verification email sent. Please check your email.",
          life: 5000,
        });
      } else {
        throw new Error("Cannot send verification email for a different user.");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to send verification email: ${error.message}`,
        life: 5000,
      });
    }
  };

  const saveEditedUser = async () => {
    // Implementation for editing existing user
    // This would typically involve updating the user's display name and email
    // You might need to create a new Cloud Function to handle this
  };

  const removeUser = (user) => {
    confirmDialog({
      message: `Are you sure you want to remove ${user.email}?`,
      header: "Confirm Removal",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const removeUserFunction = httpsCallable(functions, "removeUser");
          const result = await removeUserFunction({ uid: user.uid });
          setUsers(users.filter((u) => u.uid !== user.uid));
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: result.data.message,
          });
        } catch (error) {
          console.error("Error removing user:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: `Failed to remove user: ${error.message}`,
          });
        }
      },
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => handleEditUser(rowData)}
          tooltip="Edit User"
        />
        <Button
          icon="pi pi-envelope"
          className="p-button-rounded p-button-info p-mr-2"
          onClick={() => resendVerificationEmail(rowData)}
          tooltip="Resend Verification Email"
          disabled={rowData.emailVerified}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => removeUser(rowData)}
          tooltip="Remove User"
        />
      </>
    );
  };

  const passwordHeader = <h6>Password Strength</h6>;
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">Password Requirements:</p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>At least one lowercase letter</li>
        <li>At least one uppercase letter</li>
        <li>At least one numeric digit</li>
        <li>At least one special character</li>
        <li>8-15 characters long</li>
        <li>No spaces</li>
      </ul>
    </React.Fragment>
  );

  const dialogFooter = (
    <>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={editingUser.uid ? saveEditedUser : createAdminUser}
        autoFocus
      />
    </>
  );

  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }

  if (!currentUser) {
    return <div>You must be logged in to view this page.</div>;
  }

  return (
    <div className="admin-settings">
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2>User Management</h2>
      <div className="p-d-flex p-jc-between p-mb-3">
        <Button
          label="Refresh Users"
          icon="pi pi-refresh"
          onClick={fetchUsers}
          className="p-button-secondary"
        />
        <Button
          label="New User"
          icon="pi pi-user-plus"
          onClick={() => handleEditUser({})}
          className="p-button-success"
        />
      </div>

      <DataTable value={users} loading={loading} responsiveLayout="scroll">
        <Column field="email" header="Email" />
        <Column field="displayName" header="Name" />
        <Column
          field="emailVerified"
          header="Verified"
          body={(rowData) => (rowData.emailVerified ? "Yes" : "No")}
        />
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      <Dialog
        header={editingUser?.uid ? "Edit Admin User" : "Create New Admin User"}
        visible={showDialog}
        style={{ width: "50vw" }}
        footer={dialogFooter}
        onHide={() => setShowDialog(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="firstName">First Name</label>
            <InputText
              id="firstName"
              name="firstName"
              value={editingUser?.firstName || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="lastName">Last Name</label>
            <InputText
              id="lastName"
              name="lastName"
              value={editingUser?.lastName || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={editingUser?.email || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="password">
              Password{" "}
              {editingUser?.uid && "(Leave blank to keep current password)"}
            </label>
            <Password
              id="password"
              name="password"
              value={editingUser?.password || ""}
              onChange={handleInputChange}
              toggleMask
              header={passwordHeader}
              footer={passwordFooter}
            />
            {passwordErrors.map((error, index) => (
              <small key={index} className="p-error">
                {error}
              </small>
            ))}
          </div>
          <div className="p-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Password
              id="confirmPassword"
              name="confirmPassword"
              value={editingUser?.confirmPassword || ""}
              onChange={handleInputChange}
              toggleMask
              feedback={false}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
