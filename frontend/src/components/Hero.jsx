import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useI18n } from "../lib/contexts";
import { ArrowRight, PlayCircle, MapPin } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1546717003-caee5f93a9db?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400";

function Counter({ to, suffix = "+" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (inView) {
            const controls = animate(0, to, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (v) => setVal(Math.floor(v)),
            });
            return controls.stop;
        }
    }, [inView, to]);
    return <span ref={ref}>{val}{suffix}</span>;
}

export default function Hero({ stats }) {
    const { t } = useI18n();
    const s = stats || { projects: 150, cities: 32, team: 48, years: 12 };

    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src={HERO_IMG}
                    alt="Premium sports field"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/95 via-[#0B132B]/80 to-[#0B132B]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent" />
                <div className="absolute inset-0 grain-overlay" />
            </div>

            {/* Decorative blocks */}
            <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-emerald-brand/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-10 w-96 h-96 rounded-full bg-orange-brand/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-32">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-8 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-brand/15 border border-emerald-brand/40 text-emerald-brand text-xs font-bold tracking-[0.2em] mb-8"
                            data-testid="hero-badge"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-brand animate-pulse" />
                            {t.hero.badge}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-display text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter text-balance"
                            data-testid="hero-title"
                        >
                            {t.hero.title_part1}{" "}
                            <span className="relative inline-block">
                                <span className="gradient-text">{t.hero.title_part2}</span>
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-6 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed"
                            data-testid="hero-subtitle"
                        >
                            {t.hero.subtitle}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="mt-10 flex flex-wrap gap-3"
                        >
                            <a
                                href="#contact"
                                className="group inline-flex items-center gap-2 px-7 py-4 bg-orange-brand hover:brightness-110 text-white font-bold rounded-full shadow-2xl shadow-orange-500/30 transition-all"
                                data-testid="hero-cta-quote"
                            >
                                {t.hero.cta_quote}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold rounded-full transition-all"
                                data-testid="hero-cta-consult"
                            >
                                <PlayCircle className="w-4 h-4 text-emerald-brand" />
                                {t.hero.cta_consult}
                            </a>
                            <a
                                href="#portfolio"
                                className="inline-flex items-center gap-2 px-7 py-4 text-white/85 hover:text-white font-bold rounded-full transition-all"
                                data-testid="hero-cta-projects"
                            >
                                {t.hero.cta_projects} →
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-12 flex items-center gap-3 text-white/60 text-xs"
                        >
                            <MapPin className="w-4 h-4 text-emerald-brand" />
                            <span>Jakarta · Surabaya · Bandung · Bali · Medan · Yogyakarta · +27 cities</span>
                        </motion.div>
                    </div>

                    {/* Floating card */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="lg:col-span-4 hidden lg:block"
                    >
                        <div className="relative glass-dark rounded-3xl p-6 text-white">
                            <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-emerald-brand text-[#0B132B] text-[10px] font-black tracking-widest">FIFA · FIBA · IAAF</div>
                            <h3 className="font-display text-xl font-bold mb-2">Certified Quality</h3>
                            <p className="text-sm text-white/70 leading-relaxed">All materials internationally certified. Trusted by 100+ institutions across Indonesia.</p>
                            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-2xl font-display font-black text-emerald-brand">A+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Rating</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-display font-black text-emerald-brand">10y</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Warranty</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-display font-black text-emerald-brand">ISO</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">9001</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mt-20 glass-dark rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
                    data-testid="hero-stats"
                >
                    {[
                        { val: s.projects, suffix: "+", label: t.hero.stat_projects },
                        { val: s.cities, suffix: "+", label: t.hero.stat_cities },
                        { val: s.team, suffix: "+", label: t.hero.stat_team },
                        { val: s.years, suffix: "y", label: t.hero.stat_years },
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left text-white" data-testid={`stat-${i}`}>
                            <div className="font-display text-4xl sm:text-5xl font-black text-emerald-brand">
                                <Counter to={stat.val} suffix={stat.suffix} />
                            </div>
                            <div className="text-xs uppercase tracking-[0.2em] text-white/70 mt-2">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
