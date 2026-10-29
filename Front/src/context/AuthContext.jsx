import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    function login(t) { localStorage.setItem("token", t); setToken(t); }
    function logout() { localStorage.removeItem("token"); setToken(null); }
    const value = { token, login, logout };
return <AuthContext value={value}>{children}</AuthContext>;
}
export function useAuth() { return useContext(AuthContext); }