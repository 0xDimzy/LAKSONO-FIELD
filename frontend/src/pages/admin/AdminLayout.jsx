import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, FolderKanban, Wrench, MessageSquare, Newspaper, Star, Settings, LogOut, Bell, Search, Sun, Moon
} from "lucide-react";
import { useAuth, useTheme } from "../../lib/contexts";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/admin/projects", icon: FolderKanban, label: "Projects" },
    { to: "/admin/services", icon: Wrench, label: "Services" },
    { to: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
    { to: "/admin/blog", icon: Newspaper, label: "Blog" },
    { to: "/admin/testimonials", icon: Star, label: "Testimonials" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    return (
        <div className="min-h-screen bg-secondary/30 text-foreground flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-border/50 sticky top-0 h-screen">
                <div className="px-6 py-6 flex items-center gap-3 border-b border-border/40">
                    <div className="w-10 h-10 grid place-items-center rounded-lg bg-gradient-to-br from-[#06D6A0] to-[#048A81]">
                        <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                            <path d="M4 24 L16 6 L28 24 Z" stroke="#0B132B" strokeWidth="2.5" strokeLinejoin="round" />
                            <circle cx="16" cy="20" r="3.5" fill="#0B132B" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-display font-black text-base leading-none">Laksono</div>
                        <div className="text-[9px] font-bold tracking-[0.25em] text-emerald-brand mt-1">ADMIN</div>
                    </div>
                </div>
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    isActive
                                        ? "bg-[#0B132B] text-white"
                                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                                }`
                            }
                            data-testid={`sidebar-${item.label.toLowerCase()}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-border/40">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        data-testid="sidebar-logout"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-30 glass-panel border-b border-border/50">
                    <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="hidden md:flex flex-1 max-w-md relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <input
                                placeholder="Search projects, inquiries..."
                                className="w-full bg-foreground/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:bg-background focus:border-emerald-brand transition-colors"
                                data-testid="admin-search"
                            />
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <button onClick={toggle} className="p-2.5 rounded-full hover:bg-foreground/5" data-testid="admin-theme-toggle">
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <button className="relative p-2.5 rounded-full hover:bg-foreground/5">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-brand" />
                            </button>
                            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-border">
                                <div className="text-right">
                                    <div className="font-display font-bold text-sm leading-tight">{user?.name || "Admin"}</div>
                                    <div className="text-[10px] text-foreground/55">{user?.email}</div>
                                </div>
                                <div className="w-9 h-9 grid place-items-center rounded-full bg-emerald-brand text-[#0B132B] font-display font-black text-sm">
                                    {(user?.name || "A").charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Mobile nav */}
                    <div className="lg:hidden flex overflow-x-auto px-4 py-2 gap-2 scrollbar-thin">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                        isActive ? "bg-[#0B132B] text-white" : "bg-foreground/5 text-foreground/70"
                                    }`
                                }
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </header>
                <main className="p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
