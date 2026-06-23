import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const FRONTEND_ONLY_USER = {
  user_id: "user-ui-admin",
  id: "user-ui-admin",
  email: "study@xflow.local",
  name: "study",
  is_admin: true,
  role_id: null,
  etl_access: true,
  domain_edit_access: true,
  dataset_access: [],
  all_datasets: true,
  role_dataset_etl_access: true,
  role_query_ai_access: true,
};

export const AuthProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Restore session on mount (only once)
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    const storedUser = sessionStorage.getItem("user");

    if (storedSessionId && storedUser) {
      setSessionId(storedSessionId);
      setUser(JSON.parse(storedUser));
    } else if (import.meta.env.VITE_FRONTEND_ONLY === "true") {
      const mockSessionId = "mock-session-ui-review";
      setSessionId(mockSessionId);
      setUser(FRONTEND_ONLY_USER);
      sessionStorage.setItem("sessionId", mockSessionId);
      sessionStorage.setItem("user", JSON.stringify(FRONTEND_ONLY_USER));
    }

    // Mark auth as ready after restoration attempt
    setIsAuthReady(true);
  }, []);

  // Persist user to storage when it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const login = (newSessionId, userData) => {
    setSessionId(newSessionId);
    setUser(userData);

    // Persist to sessionStorage
    sessionStorage.setItem("sessionId", newSessionId);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setSessionId(null);
    setUser(null);
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ sessionId, user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
