import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Link } from 'react-router-dom';
import '../css/admin.css';
import { useAuth } from '../AuthProvider';

const AdminLogin = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (error) {
      // Error handling is now done in the parent component (AdminPage)
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="admin-login">
      <h2>Admin Login</h2>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            required
          />
        </div>
        <Button type="submit" label="Login" loading={loading} />
        <div className="auth-links">
          <Link to="/forgot-password" state={{ email }}>
            Forgot Password?
          </Link>
          {user && !user.emailVerified && (
            <Link to="/verify-email" state={{ email }}>
              Resend Verification Email
            </Link>
          )}
        </div>
      </div>
    </form>
  );
};

export default AdminLogin;