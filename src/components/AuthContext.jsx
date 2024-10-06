import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdTokenResult(true);
          const tokenValidAfter = token.claims.auth_time;
          const tokenIssuedAt = token.issuedAtTime / 1000;

          if (tokenIssuedAt < tokenValidAfter) {
            // Token is invalid, sign out the user
            await signOut(auth);
            setUser(null);
            navigate('/admin');
          } else {
            user.isAdmin = token.claims.admin || false;
            setUser(user);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const logout = async () => {
    try {
      // Call the server-side function to invalidate the token
      const response = await fetch('https://us-central1-quality-hi-tech-74e77.cloudfunctions.net/invalidateToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to invalidate token');
      }

      // Sign out from Firebase Auth
      await signOut(auth);

      // Clear any user-related data from local storage
      localStorage.removeItem('adminUsers');
      localStorage.removeItem('adminUsersTimestamp');

      // Clear user data from the context
      setUser(null);

      // Redirect to the login page
      navigate('/admin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (adminOnly && !user.isAdmin)) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};
