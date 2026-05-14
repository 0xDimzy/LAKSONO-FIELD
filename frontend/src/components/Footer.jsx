import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "../lib/contexts";

export default function Footer({ settings }) {
    const { t } = useI18n();
    const s = settings || {};
    return (
        <footer className="bg-[#0B132B] text-white relative overflow-hidden" data-testid="footer">
            <div className="absolute inset-0 grain-overlay" />
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-brand/10 blur-3xl" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 grid place-items-center rounded-lg bg-gradient-to-br from-[#06D6A0] to-[#048A81]">
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
                        <p className="text-white/70 leading-relaxed text-sm">{t.footer.tagline}</p>
                        <div className="flex gap-3 mt-6">
                            {[
                                { Icon: Instagram, href: s.instagram, label: "instagram" },
                                { Icon: Facebook, href: s.facebook, label: "facebook" },
                                { Icon: Linkedin, href: s.linkedin, label: "linkedin" },
                                { Icon: Youtube, href: s.youtube, label: "youtube" },
                            ].map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 grid place-items-center rounded-full bg-white/5 hover:bg-emerald-brand/20 border border-white/10 hover:border-emerald-brand transition-all"
                                    data-testid={`footer-${label}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-[0.2em] mb-5 text-emerald-brand">{t.footer.services_title}</h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/services/mini-soccer" className="hover:text-emerald-brand">Mini Soccer</Link></li>
                            <li><Link to="/services/futsal" className="hover:text-emerald-brand">Futsal Court</Link></li>
                            <li><Link to="/services/basketball" className="hover:text-emerald-brand">Basketball Court</Link></li>
                            <li><Link to="/services/tennis" className="hover:text-emerald-brand">Tennis Court</Link></li>
                            <li><Link to="/services/running-track" className="hover:text-emerald-brand">Running Track</Link></li>
                            <li><Link to="/services/synthetic-grass" className="hover:text-emerald-brand">Synthetic Grass</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-[0.2em] mb-5 text-emerald-brand">{t.footer.quick_links}</h4>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li><Link to="/" className="hover:text-emerald-brand">{t.nav.home}</Link></li>
                            <li><Link to="/projects" className="hover:text-emerald-brand">{t.nav.portfolio}</Link></li>
                            <li><Link to="/blog" className="hover:text-emerald-brand">{t.nav.blog}</Link></li>
                            <li><a href="#contact" className="hover:text-emerald-brand">{t.nav.contact}</a></li>
                            <li><Link to="/admin/login" className="hover:text-emerald-brand">Admin Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-[0.2em] mb-5 text-emerald-brand">{t.nav.contact}</h4>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-emerald-brand mt-0.5 flex-shrink-0" />
                                <span>{s.address || "Jakarta, Indonesia"}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-emerald-brand flex-shrink-0" />
                                <a href={`tel:${s.phone}`} className="hover:text-emerald-brand">{s.phone}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-emerald-brand flex-shrink-0" />
                                <a href={`mailto:${s.email}`} className="hover:text-emerald-brand">{s.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
                    <p>© {new Date().getFullYear()} Laksono Kontraktor. {t.footer.rights}.</p>
                    <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand animate-pulse" />
                        Built with precision in Indonesia
                    </p>
                </div>
            </div>
        </footer>
    );
}
