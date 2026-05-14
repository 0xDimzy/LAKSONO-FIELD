import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { translations } from "./translations";
import api from "./api";

// ============== I18n Context ==============
const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem("lk_lang") || "id");

    useEffect(() => {
        localStorage.setItem("lk_lang", lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, [lang]);

    const t = useMemo(() => translations[lang] || translations.id, [lang]);

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be inside I18nProvider");
    return ctx;
};

// ============== Theme Context ==============
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem("lk_theme") || "dark");

    useEffect(() => {
        localStorage.setItem("lk_theme", theme);
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// ============== Auth Context ==============
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const token = localStorage.getItem("lk_token");
        if (!token) {
            setUser(false);
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            localStorage.removeItem("lk_token");
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        if (data.token) localStorage.setItem("lk_token", data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        localStorage.removeItem("lk_token");
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
