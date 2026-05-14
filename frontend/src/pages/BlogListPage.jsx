import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function BlogListPage() {
    const [posts, setPosts] = useState([]);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get("/blog").then((r) => setPosts(r.data));
        api.get("/settings").then((r) => setSettings(r.data));
    }, []);

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Navbar />
            <section className="pt-32 pb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">BLOG & INSIGHTS</div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">Industry Articles</h1>
                    <p className="mt-5 text-foreground/65 max-w-2xl">Tips, guides, and expert insights from the Laksono engineering team.</p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((p) => (
                            <Link key={p.id} to={`/blog/${p.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-emerald-brand/50 transition-all" data-testid={`blog-list-${p.slug}`}>
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand text-[10px] font-bold tracking-widest mb-3">{p.category}</div>
                                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-emerald-brand transition-colors">{p.title}</h3>
                                    <p className="text-sm text-foreground/65 mt-3 line-clamp-3">{p.excerpt}</p>
                                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-brand">
                                        Read more <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            <Footer settings={settings} />
            <WhatsAppButton phone={settings?.whatsapp} />
        </div>
    );
}
