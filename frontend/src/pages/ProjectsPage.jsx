import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [settings, setSettings] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        api.get("/projects").then((r) => setProjects(r.data));
        api.get("/settings").then((r) => setSettings(r.data));
    }, []);

    const categories = [
        { id: "all", label: "All" },
        { id: "mini-soccer", label: "Mini Soccer" },
        { id: "futsal", label: "Futsal" },
        { id: "basketball", label: "Basketball" },
        { id: "tennis", label: "Tennis" },
        { id: "running-track", label: "Running Track" },
        { id: "synthetic-grass", label: "Synthetic Grass" },
        { id: "volleyball", label: "Volleyball" },
        { id: "acrylic-flooring", label: "Acrylic Flooring" },
    ];

    const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Navbar />
            <section className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">PORTFOLIO</div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">All Projects</h1>
                    <p className="mt-5 text-foreground/65 max-w-2xl">Explore our complete portfolio of sports infrastructure projects across Indonesia.</p>

                    <div className="mt-10 flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setFilter(c.id)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                    filter === c.id ? "bg-foreground text-background" : "bg-card border border-border text-foreground/70 hover:border-foreground/30"
                                }`}
                                data-testid={`projects-filter-${c.id}`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((p) => (
                            <div key={p.id} className="group rounded-2xl overflow-hidden bg-card border border-border" data-testid={`projects-card-${p.id}`}>
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-emerald-brand mb-2">
                                        <span>{p.completion_year}</span><span>·</span><span className="capitalize">{p.category.replace("-", " ")}</span>
                                    </div>
                                    <h3 className="font-display font-bold text-lg leading-tight">{p.title}</h3>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-foreground/65">
                                        <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.location}</span>
                                        <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{p.area_size}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer settings={settings} />
            <WhatsAppButton phone={settings?.whatsapp} />
        </div>
    );
}
