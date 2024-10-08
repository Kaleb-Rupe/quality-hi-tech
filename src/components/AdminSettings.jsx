import React, { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
// import { Password } from "primereact/password";
import { Dialog } from "primereact/dialog";
// import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  getAuth,
  // createUserWithEmailAndPassword,
  // sendEmailVerification,
  // updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import useScreenSize from '../hooks/useScreenSize';
import { secureSet, secureGet, clearInvoiceCache } from '../utils/secureStorage';
import emailjs from '@emailjs/browser';

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState("");
  // const [passwordErrors, setPasswordErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const toast = useRef(null);
  const functions = getFunctions();
  const auth = getAuth();
  const isMobile = useScreenSize();

  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_INIT);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const cachedUsers = secureGet("adminUsers");
      const cachedTimestamp = secureGet("adminUsersTimestamp");
      const now = new Date().getTime();

      if (
        cachedUsers &&
        Array.isArray(cachedUsers) &&
        cachedTimestamp &&
        now - parseInt(cachedTimestamp) < 60 * 60 * 1000
      ) {
        setUsers(cachedUsers);
        setLoading(false);
        return;
      }

      const listAdminUsers = httpsCallable(functions, "listAdminUsers");
      const result = await Promise.race([
        listAdminUsers(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Function timed out")), 10000)
        ),
      ]);

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid response from server");
      }

      setUsers(result.data);

      secureSet("adminUsers", result.data);
      secureSet("adminUsersTimestamp", now.toString());
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to fetch admin users: ${error.message}`,
      });

      const cachedUsers = secureGet("adminUsers");
      if (cachedUsers && Array.isArray(cachedUsers)) {
        setUsers(cachedUsers);
        toast.current.show({
          severity: "info",
          summary: "Using Cached Data",
          detail: "Displaying previously cached user data.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [functions, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
      if (user) {
        fetchUsers();
      } else {
        setLoading(false);
        // Clear cache when user logs out
        localStorage.removeItem("adminUsers");
        localStorage.removeItem("adminUsersTimestamp");
        clearInvoiceCache(); // Add this line to clear the invoice cache
      }
    });

    return () => unsubscribe();
  }, [auth, fetchUsers]);

  // const validatePassword = (password) => {
  //   const errors = [];
  //   if (password.length < 8 || password.length > 15) {
  //     errors.push("Password length should be between 8 to 15 characters.");
  //   }
  //   if (!/\d/.test(password)) {
  //     errors.push("Password should contain at least one digit (0-9).");
  //   }
  //   if (!/[a-z]/.test(password)) {
  //     errors.push(
  //       "Password should contain at least one lowercase letter (a-z)."
  //     );
  //   }
  //   if (!/[A-Z]/.test(password)) {
  //     errors.push(
  //       "Password should contain at least one uppercase letter (A-Z)."
  //     );
  //   }
  //   if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
  //     errors.push(
  //       "Password should contain at least one special character (@, #, %, &, !, $, etc)."
  //     );
  //   }
  //   if (/\s/.test(password)) {
  //     errors.push("Password should not contain any space.");
  //   }
  //   return errors;
  // };

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
    // if (name === "password") {
    //   setPasswordErrors(validatePassword(value));
    // }
  };

  const handleCreateUser = async () => {
    if (editingUser.firstName.trim() === '' || editingUser.lastName.trim() === '' || !editingUser.email) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "First name, last name, and email are required",
      });
      return;
    }

    setLoading(true);
    try {
      const createNewAdmin = httpsCallable(functions, "createNewAdmin");
      const result = await createNewAdmin({
        email: editingUser.email,
        displayName: `${editingUser.firstName} ${editingUser.lastName}`,
      });

      // Send password reset email using EmailJS
      await sendPasswordResetEmail(editingUser.email, result.data.passwordResetLink, editingUser.firstName);

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "New admin user created successfully. A password reset email has been sent.",
      });

      setShowDialog(false);
      localStorage.removeItem("adminUsers");
      localStorage.removeItem("adminUsersTimestamp");
      fetchUsers();
    } catch (error) {
      console.error("Error creating new admin user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to create new admin user: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

 const sendPasswordResetEmail = async (resetLink) => {
   try {
     await emailjs.send(
       process.env.REACT_APP_EMAILJS_SERVICEID,
       "template_doto7zf",
       {
         to_email: editingUser.email,
         reset_link: resetLink,
         first_name: editingUser.firstName,
       },
       process.env.REACT_APP_EMAILJS_INIT
     );
     console.log(
       "Password reset email sent successfully to",
       editingUser.email
     );
   } catch (error) {
     console.error("Error sending password reset email:", error);
     throw new Error("Failed to send password reset email");
   }
 };

  // const resendVerificationEmail = async (userEmail) => {
  //   setLoading(true);
  //   try {
  //     const auth = getAuth();
  //     const user = auth.currentUser;

  //     if (!user) {
  //       throw new Error("No authenticated user found");
  //     }

  //     await sendEmailVerification(user);
  //     toast.current.show({
  //       severity: "success",
  //       summary: "Success",
  //       detail: "Verification email sent. Please check your inbox.",
  //     });
  //   } catch (error) {
  //     console.error("Error sending verification email:", error);
  //     toast.current.show({
  //       severity: "error",
  //       summary: "Error",
  //       detail: "Failed to send verification email: " + error.message,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const saveEditedUser = async () => {
    try {
      const editAdminUser = httpsCallable(functions, "editAdminUser");
      await editAdminUser({
        uid: editingUser.uid,
        displayName: `${editingUser.firstName} ${editingUser.lastName}`.trim(),
        email: editingUser.email,
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Admin user updated successfully.",
        life: 5000,
      });
      setShowDialog(false);
      localStorage.removeItem("adminUsers");
      localStorage.removeItem("adminUsersTimestamp");
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error editing admin user:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to edit admin user: ${error.message}`,
        life: 5000,
      });
    }
  };

  const deleteAdmin = (user) => {
    confirmDialog({
      message: `Are you sure you want to delete the admin user ${user.email}?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const deleteAdminFunction = httpsCallable(functions, "deleteAdmin");
          await deleteAdminFunction({ uid: user.uid });
          setUsers(users.filter((u) => u.uid !== user.uid));
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Admin user deleted successfully.",
          });
          localStorage.removeItem("adminUsers");
          localStorage.removeItem("adminUsersTimestamp");
          fetchUsers(); // Refresh the user list
        } catch (error) {
          console.error("Error deleting admin user:", error);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: `Failed to delete admin user: ${error.message}`,
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
          tooltip={isMobile ? null : "Edit User"}
        />
        {/* <Button
          icon="pi pi-envelope"
          className="p-button-rounded p-button-info p-mr-2"
          onClick={() => resendVerificationEmail(rowData.email)}
          tooltip={isMobile ? null : "Resend Verification Email"}
          disabled={rowData.emailVerified}
        /> */}
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => deleteAdmin(rowData)}
          tooltip={isMobile ? null : "Delete Admin User"}
        />
      </>
    );
  };

  // const passwordHeader = <h6>Password Strength</h6>;
  // const passwordFooter = (
  //   <React.Fragment>
  //     <Divider />
  //     <p className="mt-2">Password Requirements:</p>
  //     <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
  //       <li>At least one lowercase letter</li>
  //       <li>At least one uppercase letter</li>
  //       <li>At least one numeric digit</li>
  //       <li>At least one special character</li>
  //       <li>8-15 characters long</li>
  //       <li>No spaces</li>
  //     </ul>
  //   </React.Fragment>
  // );

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
        onClick={editingUser.uid ? saveEditedUser : handleCreateUser}
        autoFocus
      />
    </>
  );

  const handleRefreshUsers = () => {
    localStorage.removeItem("adminUsers");
    localStorage.removeItem("adminUsersTimestamp");
    fetchUsers();
  };

  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }

  if (!currentUser) {
    return <div>You must be logged in to view this page.</div>;
  }

  return (
    <div className="admin-settings">
      <Toast ref={toast} position="top-right" />
      <h2>User Management</h2>
      <div className="p-d-flex p-jc-between p-mb-3">
        <Button
          label="Refresh Users"
          icon="pi pi-refresh"
          onClick={handleRefreshUsers}
          className="p-button-secondary"
        />
        <Button
          label="New User"
          icon="pi pi-user-plus"
          onClick={() => handleEditUser({})}
          className="p-button-success"
        />
      </div>

      {isMobile ? (
        // Mobile version
        <div className="mobile-user-list">
          {loading ? (
            <div className="loading-indicator">
              <ProgressSpinner />
              <p>Loading admin users...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user.uid} className="mobile-user-item">
                <div>{user.email}</div>
                <div>{user.displayName}</div>
                <div>{user.emailVerified ? "Verified" : "Not Verified"}</div>
                <div className="mobile-user-actions">
                  {actionBodyTemplate(user)}
                </div>
              </div>
            ))
          ) : (
            <p>No admin users found.</p>
          )}
        </div>
      ) : (
        // Desktop version
        <DataTable value={users} loading={loading} responsiveLayout="scroll">
          <Column field="email" header="Email" />
          <Column field="displayName" header="Name" />
          <Column
            field="emailVerified"
            header="Verified"
            body={(rowData) => (rowData.emailVerified ? "Yes" : "No")}
          />
          {!isMobile ? (
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "8rem" }}
            />
          ) : (
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ width: "90vw" }}
            />
          )}
        </DataTable>
      )}

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
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="lastName">Last Name</label>
            <InputText
              id="lastName"
              name="lastName"
              value={editingUser?.lastName || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              value={editingUser?.email || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          {!editingUser?.uid && (
            <small className="p-mt-2">
              A password reset link will be generated and sent to the user's email.
            </small>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default AdminSettings;