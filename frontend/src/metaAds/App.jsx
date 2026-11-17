import { useCallback, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "./api";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [loginError, setLoginError] = useState(() => new URLSearchParams(window.location.search).get("login_error"));

  useEffect(() => {
    // Duo sends people back with ?login_error=...; show it once and clean the address bar.
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
    setUnauthorizedHandler(() => setUser(null));
    api.me().then(setUser, () => setUser(null));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  if (user === undefined)
    return <div className="min-h-screen grid place-items-center text-sm text-[#6b6b63]">Loading…</div>;

  if (!user)
    return (
      <Login
        initialError={loginError}
        onSignedIn={(signedIn) => {
          setLoginError(null);
          setUser(signedIn);
        }}
      />
    );

  return <Dashboard user={user} onLogout={logout} />;
}
