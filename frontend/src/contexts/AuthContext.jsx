// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { api } from "../services/api";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check token on mount and route changes
  useEffect(() => {
    const token = api.getToken();
    const storedUser = api.getUser();

    if (token && !isTokenExpired(token) && storedUser) {
      setUser(storedUser);
    } else if (token && isTokenExpired(token)) {
      // Token expired - logout
      api.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Check token validity on route changes
  useEffect(() => {
    if (loading) return;
    const token = api.getToken();
    if (token && isTokenExpired(token)) {
      api.logout();
      setUser(null);
    }
  }, [location.pathname, loading]);

  // Periodic token check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const token = api.getToken();
      if (token && isTokenExpired(token)) {
        api.logout();
        setUser(null);
        // Optional: dispatch a custom event that components can listen to
        window.dispatchEvent(new CustomEvent("tokenExpired"));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.login(credentials);
    if (response.status && response.token) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const storedUser = api.getUser();
      setUser(storedUser);
    }
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await api.register(userData);
    if (response.status && response.token) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const storedUser = api.getUser();
      setUser(storedUser);
    }
    return response;
  }, []);

  const forgotPassword = useCallback((data) => api.forgotPassword(data), []);

  const resetPassword = useCallback((data) => api.resetPassword(data), []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  // Stable reference so effects that depend on it don't re-run every render.
  const isAuthenticated = useCallback(() => {
    const token = api.getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  }, []);

  // Recomputed on navigation as well, so consumers re-check isAuthenticated() after
  // a token was removed outside this provider (e.g. a 401 handler in api.js).
  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated,
      forgotPassword,
      resetPassword,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, location.pathname, login, register, logout, isAuthenticated, forgotPassword, resetPassword],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
