import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Maximize2, Star, ArrowRight, Calendar } from "lucide-react";
import { useI18n } from "../lib/contexts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

// ============ BEFORE-AFTER SLIDER ============
function BeforeAfter({ before, after, label = "Before / After" }) {
    const [pos, setPos] = useState(50);
    const trackRef = useRef(null);
    const drag = (e) => {
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        if (!clientX) return;
        const p = ((clientX - rect.left) / rect.width) * 100;
        setPos(Math.max(0, Math.min(100, p)));
    };
    return (
        <div
            ref={trackRef}
            onMouseMove={(e) => e.buttons === 1 && drag(e)}
            onTouchMove={drag}
            onClick={drag}
            className="relative aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none"
        >
            <img src={after} alt="after" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
                <img src={before} alt="before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 * (100 / Math.max(pos, 1))}%`, maxWidth: "none" }} />
            </div>
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold tracking-widest">BEFORE</div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-brand text-[#0B132B] text-[10px] font-bold tracking-widest">AFTER</div>
            <div
                className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none"
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white grid place-items-center shadow-xl">
                    <div className="flex gap-0.5">
                        <ArrowRight className="w-3 h-3 text-[#0B132B] rotate-180" />
                        <ArrowRight className="w-3 h-3 text-[#0B132B]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ PORTFOLIO SECTION ============
export function PortfolioSection({ projects }) {
    const { t } = useI18n();
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    const categories = [
        { id: "all", label: t.portfolio.filter_all },
        { id: "mini-soccer", label: "Mini Soccer" },
        { id: "futsal", label: "Futsal" },
        { id: "basketball", label: "Basketball" },
        { id: "tennis", label: "Tennis" },
        { id: "running-track", label: "Running Track" },
        { id: "synthetic-grass", label: "Synthetic Grass" },
    ];

    const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

    return (
        <section id="portfolio" className="relative py-24 lg:py-32 bg-secondary/30" data-testid="portfolio-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.portfolio.tag}</div>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">{t.portfolio.title}</h2>
                        <p className="mt-4 text-foreground/65">{t.portfolio.subtitle}</p>
                    </div>
                    <Link to="/projects" className="hidden lg:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-foreground/15 hover:border-emerald-brand hover:text-emerald-brand text-sm font-bold transition-colors" data-testid="portfolio-view-all">
                        View All Projects <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2 mb-10 scrollbar-thin overflow-x-auto pb-2">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setFilter(c.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                                filter === c.id
                                    ? "bg-foreground text-background"
                                    : "bg-card border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30"
                            }`}
                            data-testid={`filter-${c.id}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.slice(0, 9).map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                            className="group relative rounded-2xl overflow-hidden bg-card border border-border cursor-pointer"
                            onClick={() => setSelected(p)}
                            data-testid={`project-card-${p.id}`}
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-transparent to-transparent" />
                            </div>
                            <div className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/15 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-4 h-4" />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-emerald-brand mb-2">
                                    <span>{p.completion_year}</span>
                                    <span>·</span>
                                    <span className="capitalize">{p.category.replace("-", " ")}</span>
                                </div>
                                <h3 className="font-display font-bold text-lg leading-tight">{p.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-xs text-white/75">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {p.location}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        {selected && (
                            <>
                                <DialogHeader>
                                    <div className="text-xs font-bold tracking-[0.2em] text-emerald-brand">{selected.category.toUpperCase().replace("-", " ")} · {selected.completion_year}</div>
                                    <DialogTitle className="font-display text-2xl">{selected.title}</DialogTitle>
                                </DialogHeader>
                                {selected.before_image && selected.after_image ? (
                                    <BeforeAfter before={selected.before_image} after={selected.after_image} />
                                ) : (
                                    <img src={selected.cover_image} alt={selected.title} className="rounded-xl w-full aspect-[16/10] object-cover" />
                                )}
                                <p className="text-foreground/70 leading-relaxed">{selected.description}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-foreground/55">Location</div>
                                        <div className="font-bold text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-brand" />{selected.location}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-foreground/55">Surface</div>
                                        <div className="font-bold text-sm mt-1">{selected.surface_type}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-foreground/55">Area</div>
                                        <div className="font-bold text-sm mt-1">{selected.area_size}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-foreground/55">Year</div>
                                        <div className="font-bold text-sm mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-brand" />{selected.completion_year}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}

// ============ TESTIMONIALS ============
export function TestimonialsSection({ testimonials }) {
    const { t } = useI18n();
    return (
        <section className="relative py-24 lg:py-32 bg-background" data-testid="testimonials-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-14">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.testimonials.tag}</div>
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">{t.testimonials.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {testimonials.map((tm, i) => (
                        <motion.div
                            key={tm.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="bg-card border border-border rounded-2xl p-6 hover:border-emerald-brand/50 transition-colors"
                            data-testid={`testimonial-${i}`}
                        >
                            <div className="flex gap-0.5 mb-4 text-orange-brand">
                                {[...Array(tm.rating || 5)].map((_, k) => (
                                    <Star key={k} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">"{tm.message}"</p>
                            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border">
                                <img src={tm.avatar} alt={tm.name} className="w-11 h-11 rounded-full object-cover" />
                                <div className="min-w-0">
                                    <div className="font-display font-bold text-sm truncate">{tm.name}</div>
                                    <div className="text-xs text-foreground/55 truncate">{tm.role} · {tm.company}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============ BLOG PREVIEW ============
export function BlogPreview({ posts }) {
    const { t } = useI18n();
    return (
        <section id="blog" className="relative py-24 lg:py-32 bg-secondary/30" data-testid="blog-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.blog.tag}</div>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter">{t.blog.title}</h2>
                    </div>
                    <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-foreground/15 hover:border-emerald-brand hover:text-emerald-brand text-sm font-bold transition-colors" data-testid="blog-view-all">
                        All Articles <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.slice(0, 3).map((post, i) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            data-testid={`blog-card-${i}`}
                        >
                            <Link to={`/blog/${post.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-emerald-brand/50 transition-all">
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand text-[10px] font-bold tracking-widest mb-3">{post.category}</div>
                                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-emerald-brand transition-colors">{post.title}</h3>
                                    <p className="text-sm text-foreground/65 mt-3 line-clamp-2">{post.excerpt}</p>
                                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-brand">
                                        {t.blog.read_more}
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
