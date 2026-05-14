import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false));
        api.get("/settings").then((r) => setSettings(r.data));
    }, [slug]);

    if (post === null) return <div className="min-h-screen grid place-items-center">Loading...</div>;
    if (post === false) return <div className="min-h-screen grid place-items-center">Article not found</div>;

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Navbar />
            <article className="pt-32 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-foreground/65 hover:text-emerald-brand text-sm font-bold mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-brand/10 text-emerald-brand text-[10px] font-bold tracking-widest mb-5">{post.category}</div>
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">{post.title}</h1>
                    <p className="mt-5 text-foreground/65 text-lg">{post.excerpt}</p>
                    <div className="mt-6 text-sm text-foreground/55">By {post.author}</div>
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                    <img src={post.cover_image} alt={post.title} className="w-full aspect-[16/8] object-cover rounded-3xl" />
                </div>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </div>
                    <div className="mt-10 flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                            <span key={tag} className="px-3 py-1.5 rounded-full bg-secondary text-xs font-bold">#{tag}</span>
                        ))}
                    </div>
                </div>
            </article>
            <Footer settings={settings} />
            <WhatsAppButton phone={settings?.whatsapp} />
        </div>
    );
}
