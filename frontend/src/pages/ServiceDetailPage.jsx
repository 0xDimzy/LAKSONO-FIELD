import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Clock, Wallet, Layers } from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

export default function ServiceDetailPage() {
    const { slug } = useParams();
    const [svc, setSvc] = useState(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get(`/services/${slug}`).then((r) => setSvc(r.data)).catch(() => setSvc(false));
        api.get("/settings").then((r) => setSettings(r.data));
    }, [slug]);

    if (svc === null) return <div className="min-h-screen grid place-items-center text-foreground">Loading...</div>;
    if (svc === false) return <div className="min-h-screen grid place-items-center text-foreground">Service not found</div>;

    return (
        <div className="bg-background text-foreground min-h-screen">
            <Navbar />
            <section className="relative pt-32 pb-20">
                <div className="absolute inset-x-0 top-0 h-[60vh]">
                    <img src={svc.image} alt={svc.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/85 via-[#0B132B]/60 to-background" />
                </div>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/85 hover:text-emerald-brand text-sm font-bold mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">SERVICE DETAIL</div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white max-w-3xl">{svc.title}</h1>
                    <p className="mt-5 text-white/80 text-lg max-w-3xl">{svc.short_desc}</p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <Clock className="w-5 h-5 text-emerald-brand mb-2" />
                            <div className="text-xs uppercase tracking-wider text-foreground/55">Duration</div>
                            <div className="font-display font-bold text-lg">{svc.duration}</div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <Wallet className="w-5 h-5 text-emerald-brand mb-2" />
                            <div className="text-xs uppercase tracking-wider text-foreground/55">Starting Price</div>
                            <div className="font-display font-bold text-lg">{svc.starting_price}</div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <Layers className="w-5 h-5 text-emerald-brand mb-2" />
                            <div className="text-xs uppercase tracking-wider text-foreground/55">Materials</div>
                            <div className="font-display font-bold text-lg">{svc.materials.length}+ options</div>
                        </div>
                    </div>

                    <div className="mt-16 grid lg:grid-cols-2 gap-12">
                        <div>
                            <h2 className="font-display text-2xl font-black mb-5">Overview</h2>
                            <p className="text-foreground/75 leading-relaxed">{svc.full_desc}</p>
                            <h3 className="font-display text-xl font-bold mt-8 mb-4">Key Features</h3>
                            <ul className="space-y-3">
                                {svc.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-brand flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-bold mb-4">Materials & Specs</h3>
                            <div className="space-y-2">
                                {svc.materials.map((m, i) => (
                                    <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 text-sm">
                                        <span className="text-emerald-brand font-bold mr-2">{String(i+1).padStart(2,'0')}</span>{m}
                                    </div>
                                ))}
                            </div>
                            <h3 className="font-display text-xl font-bold mt-8 mb-4">Construction Workflow</h3>
                            <ol className="space-y-3">
                                {svc.workflow.map((w, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <span className="w-7 h-7 grid place-items-center rounded-full bg-emerald-brand/15 text-emerald-brand font-bold text-xs flex-shrink-0">{i+1}</span>
                                        {w}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="mt-16 bg-gradient-to-br from-[#0B132B] to-[#1C2541] rounded-3xl p-10 text-white text-center">
                        <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tighter">Ready to start your project?</h3>
                        <p className="text-white/70 mt-3">Get a free consultation and detailed quotation tailored to your needs.</p>
                        <Link to="/#contact" className="inline-flex items-center gap-2 mt-6 px-8 py-4 bg-orange-brand hover:brightness-110 rounded-full font-bold">
                            Request Quotation
                        </Link>
                    </div>
                </div>
            </section>
            <Footer settings={settings} />
            <WhatsAppButton phone={settings?.whatsapp} />
        </div>
    );
}
