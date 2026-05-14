import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth, useI18n } from "../../lib/contexts";

export default function AdminLoginPage() {
    const { user, login } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@laksonokontraktor.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to="/admin" replace />;

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back, Admin!");
            navigate("/admin");
        } catch (err) {
            const detail = err.response?.data?.detail;
            const msg = typeof detail === "string" ? detail : t.admin.invalid;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-[#0B132B] text-white grid place-items-center px-4">
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400"
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B132B] via-[#0B132B]/85 to-[#048A81]/40" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md glass-dark rounded-3xl p-8 sm:p-10"
                data-testid="admin-login-card"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 grid place-items-center rounded-xl bg-gradient-to-br from-[#06D6A0] to-[#048A81]">
                        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                            <path d="M4 24 L16 6 L28 24 Z" stroke="#0B132B" strokeWidth="2.5" strokeLinejoin="round" />
                            <circle cx="16" cy="20" r="3.5" fill="#0B132B" />
                            <path d="M9 24 L23 24" stroke="#0B132B" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-display font-black text-xl leading-none">Laksono</div>
                        <div className="text-[10px] font-bold tracking-[0.25em] text-emerald-brand mt-1">KONTRAKTOR</div>
                    </div>
                </div>

                <h1 className="font-display text-3xl font-black tracking-tighter">{t.admin.login_title}</h1>
                <p className="text-white/65 text-sm mt-2">{t.admin.login_subtitle}</p>

                <form onSubmit={submit} className="mt-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold tracking-[0.2em] text-white/65 mb-2 uppercase">{t.admin.email}</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 focus:border-emerald-brand rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 outline-none"
                                data-testid="admin-email"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold tracking-[0.2em] text-white/65 mb-2 uppercase">{t.admin.password}</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/15 focus:border-emerald-brand rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 outline-none"
                                data-testid="admin-password"
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-400 text-sm" data-testid="admin-error">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-brand hover:brightness-110 disabled:opacity-60 text-[#0B132B] font-bold rounded-xl transition-all"
                        data-testid="admin-submit"
                    >
                        {loading ? "Signing in..." : t.admin.sign_in}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
