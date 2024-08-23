import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user, true);
          setUserRole(tokenResult.claims.role || 'user');

          // Check token expiration
          const expirationTime = new Date(tokenResult.expirationTime).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiration = expirationTime - currentTime;

          if (timeUntilExpiration < 5 * 60 * 1000) { // 5 minutes before expiration
            const functions = getFunctions();
            const refreshToken = httpsCallable(functions, 'refreshToken');
            await refreshToken();
          }
        } catch (error) {
          console.error("Error checking token:", error);
          await signOut(auth);
        }
      } else {
        setUserRole(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    userRole,
    isAdmin: userRole === 'admin' || userRole === 'superadmin',
    isSuperAdmin: userRole === 'superadmin',
    isEmailVerified: user?.emailVerified || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};