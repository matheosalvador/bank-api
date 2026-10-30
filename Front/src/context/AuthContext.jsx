import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    function login(tokenValue, userData) {
        localStorage.setItem("token", tokenValue);
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        }
        setToken(tokenValue);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }

    const value = { token, user, login, logout };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
