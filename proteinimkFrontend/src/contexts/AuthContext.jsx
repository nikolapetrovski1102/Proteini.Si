// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      if (!exp) return true;
      return Date.now() >= exp * 1000;
    } catch (error) {
      return true;
    }
  };

  // Check and handle token expiration
  const checkTokenValidity = () => {
    const token = api.getToken();
    if (token && isTokenExpired(token)) {
      api.logout();
      setUser(null);
      return false;
    }
    return !!token;
  };

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
    if (!loading) {
      checkTokenValidity();
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

  const login = async (credentials) => {
    const response = await api.login(credentials);
    if (response.status && response.token) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const storedUser = api.getUser();
      setUser(storedUser);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.status && response.token) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const storedUser = api.getUser();
      setUser(storedUser);
    }
    return response;
  };

  const forgotPassword = async (data) => {
    return await api.forgotPassword(data);
  };

  const resetPassword = async (data) => {
    return await api.resetPassword(data);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    const token = api.getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
