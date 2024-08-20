import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { analytics } from '../firebaseConfig';
import { logEvent } from 'firebase/analytics';
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Header from "../shared/Header";
import "../css/admin.css";

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    logEvent(analytics, 'login');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      logEvent(analytics, 'logout');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="admin-page">
      <Header isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
      {isLoggedIn ? (
        <>
          <AdminDashboard />
        </>
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AdminPage;