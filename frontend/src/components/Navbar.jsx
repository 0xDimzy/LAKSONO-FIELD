import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useI18n, useTheme } from "../lib/contexts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const LANGS = [
    { code: "id", label: "Bahasa Indonesia", short: "ID" },
    { code: "en", label: "English", short: "EN" },
    { code: "ar", label: "العربية", short: "AR" },
];

export default function Navbar() {
    const { lang, setLang, t } = useI18n();
    const { theme, toggle } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [location]);

    const isLanding = location.pathname === "/";

    const navItems = [
        { label: t.nav.home, to: "/", anchor: "home" },
        { label: t.nav.services, to: "/#services", anchor: "services" },
        { label: t.nav.portfolio, to: "/projects" },
        { label: t.nav.process, to: "/#process", anchor: "process" },
        { label: t.nav.blog, to: "/blog" },
        { label: t.nav.contact, to: "/#contact", anchor: "contact" },
    ];

    const handleAnchor = (e, anchor) => {
        if (isLanding && anchor) {
            e.preventDefault();
            const el = document.getElementById(anchor);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
                scrolled || !isLanding
                    ? "bg-background/85 backdrop-blur-xl border-b border-border/50 shadow-sm"
                    : "bg-transparent"
            }`}
            data-testid="navbar"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo">
                    <div className="relative w-11 h-11 grid place-items-center rounded-lg bg-gradient-to-br from-[#06D6A0] to-[#048A81] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                            <path d="M4 24 L16 6 L28 24 Z" stroke="#0B132B" strokeWidth="2.5" strokeLinejoin="round" />
                            <circle cx="16" cy="20" r="3.5" fill="#0B132B" />
                            <path d="M9 24 L23 24" stroke="#0B132B" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="hidden sm:block">
                        <div className={`font-display font-black text-lg leading-none ${scrolled || !isLanding ? "text-foreground" : "text-white"}`}>
                            Laksono
                        </div>
                        <div className={`text-[10px] font-bold tracking-[0.25em] mt-0.5 ${scrolled || !isLanding ? "text-emerald-brand" : "text-emerald-brand"}`}>
                            KONTRAKTOR
                        </div>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            onClick={(e) => handleAnchor(e, item.anchor)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all hover:bg-foreground/5 ${
                                scrolled || !isLanding ? "text-foreground/80 hover:text-foreground" : "text-white/85 hover:text-white"
                            }`}
                            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${
                                    scrolled || !isLanding
                                        ? "border-border bg-background hover:bg-foreground/5 text-foreground"
                                        : "border-white/30 bg-white/10 hover:bg-white/20 text-white"
                                }`}
                                data-testid="lang-switcher"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                {LANGS.find(l => l.code === lang)?.short}
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {LANGS.map((l) => (
                                <DropdownMenuItem
                                    key={l.code}
                                    onClick={() => setLang(l.code)}
                                    className={`cursor-pointer ${lang === l.code ? "font-bold text-emerald-brand" : ""}`}
                                    data-testid={`lang-${l.code}`}
                                >
                                    {l.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={toggle}
                        className={`p-2.5 rounded-full transition-all border ${
                            scrolled || !isLanding
                                ? "border-border bg-background hover:bg-foreground/5 text-foreground"
                                : "border-white/30 bg-white/10 hover:bg-white/20 text-white"
                        }`}
                        aria-label="Toggle theme"
                        data-testid="theme-toggle"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <a
                        href="#contact"
                        onClick={(e) => isLanding && handleAnchor(e, "contact")}
                        className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-brand hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
                        data-testid="navbar-cta-quote"
                    >
                        {t.nav.quote}
                    </a>

                    <button
                        className={`lg:hidden p-2 rounded-full ${scrolled || !isLanding ? "text-foreground" : "text-white"}`}
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Menu"
                        data-testid="menu-toggle"
                    >
                        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border"
                    >
                        <nav className="px-4 py-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={(e) => handleAnchor(e, item.anchor)}
                                    className="block px-4 py-3 text-base font-semibold text-foreground hover:bg-foreground/5 rounded-lg"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <a
                                href="#contact"
                                className="block mt-4 text-center px-5 py-3 rounded-full bg-orange-brand text-white font-bold"
                            >
                                {t.nav.quote}
                            </a>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
