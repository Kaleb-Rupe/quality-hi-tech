import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import "../css/admin.css";

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && user.isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="admin-page">
      <AdminLogin />
    </div>
  );
};

export default AdminPage;
