import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { useI18n } from "../lib/contexts";
import api from "../lib/api";

export default function ContactSection({ settings, services }) {
    const { t } = useI18n();
    const [form, setForm] = useState({
        name: "", email: "", phone: "", company: "",
        service_type: services?.[0]?.title || "Mini Soccer Field",
        project_location: "", area_size: "", budget_range: "", message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/inquiries", form);
            toast.success(t.contact.success);
            setForm({
                name: "", email: "", phone: "", company: "",
                service_type: services?.[0]?.title || "Mini Soccer Field",
                project_location: "", area_size: "", budget_range: "", message: "",
            });
        } catch (err) {
            toast.error(t.contact.error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" className="relative py-24 lg:py-32 bg-[#0B132B] text-white overflow-hidden" data-testid="contact-section">
            <div className="absolute inset-0 grain-overlay" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-brand/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-orange-brand/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5"
                    >
                        <div className="text-xs font-bold tracking-[0.25em] text-emerald-brand mb-4">{t.contact.tag}</div>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-tight text-balance">{t.contact.title}</h2>
                        <p className="mt-5 text-white/70 leading-relaxed">{t.contact.subtitle}</p>

                        <div className="mt-10 space-y-5">
                            <div className="flex items-start gap-4 p-4 rounded-2xl glass-dark">
                                <div className="w-11 h-11 grid place-items-center rounded-xl bg-emerald-brand text-[#0B132B] flex-shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-white/55 uppercase tracking-wider">Call us</div>
                                    <a href={`tel:${settings?.phone}`} className="font-display font-bold text-lg hover:text-emerald-brand transition-colors">{settings?.phone || "+62 812 3456 7890"}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl glass-dark">
                                <div className="w-11 h-11 grid place-items-center rounded-xl bg-emerald-brand text-[#0B132B] flex-shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-white/55 uppercase tracking-wider">Email</div>
                                    <a href={`mailto:${settings?.email}`} className="font-display font-bold text-lg hover:text-emerald-brand transition-colors">{settings?.email || "info@laksonokontraktor.com"}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl glass-dark">
                                <div className="w-11 h-11 grid place-items-center rounded-xl bg-emerald-brand text-[#0B132B] flex-shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-white/55 uppercase tracking-wider">Office</div>
                                    <div className="font-display font-bold text-base">{settings?.address || "Jakarta, Indonesia"}</div>
                                </div>
                            </div>
                            <a
                                href={`https://wa.me/${settings?.whatsapp || '6281234567890'}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-brand text-[#0B132B] hover:brightness-110 transition-all"
                                data-testid="contact-whatsapp-link"
                            >
                                <div className="w-11 h-11 grid place-items-center rounded-xl bg-[#0B132B] text-emerald-brand flex-shrink-0">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-wider opacity-80">Quick Chat</div>
                                    <div className="font-display font-bold text-lg">Chat via WhatsApp</div>
                                </div>
                            </a>
                        </div>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={submit}
                        className="lg:col-span-7 glass-dark rounded-3xl p-6 sm:p-10"
                        data-testid="contact-form"
                    >
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label={t.contact.name} value={form.name} onChange={update("name")} required testid="form-name" />
                            <Field label={t.contact.email} type="email" value={form.email} onChange={update("email")} required testid="form-email" />
                            <Field label={t.contact.phone} value={form.phone} onChange={update("phone")} required testid="form-phone" />
                            <Field label={t.contact.company} value={form.company} onChange={update("company")} testid="form-company" />
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold tracking-[0.2em] text-white/65 mb-2 uppercase">{t.contact.service}</label>
                                <select
                                    value={form.service_type}
                                    onChange={update("service_type")}
                                    className="w-full bg-white/5 border border-white/15 focus:border-emerald-brand rounded-xl px-4 py-3 text-white outline-none transition-colors"
                                    data-testid="form-service"
                                >
                                    {(services || []).map((s) => (
                                        <option key={s.id} value={s.title} className="bg-[#0B132B]">{s.title}</option>
                                    ))}
                                </select>
                            </div>
                            <Field label={t.contact.location} value={form.project_location} onChange={update("project_location")} testid="form-location" />
                            <Field label={t.contact.area} value={form.area_size} onChange={update("area_size")} testid="form-area" />
                            <div className="sm:col-span-2">
                                <Field label={t.contact.budget} value={form.budget_range} onChange={update("budget_range")} testid="form-budget" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold tracking-[0.2em] text-white/65 mb-2 uppercase">{t.contact.message}</label>
                                <textarea
                                    value={form.message}
                                    onChange={update("message")}
                                    rows={4}
                                    required
                                    className="w-full bg-white/5 border border-white/15 focus:border-emerald-brand rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors resize-none"
                                    data-testid="form-message"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-brand hover:brightness-110 disabled:opacity-60 text-white font-bold rounded-full shadow-2xl shadow-orange-500/30 transition-all"
                            data-testid="form-submit"
                        >
                            {submitting ? "Sending..." : t.contact.submit}
                            <Send className="w-4 h-4" />
                        </button>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}

function Field({ label, value, onChange, type = "text", required, testid }) {
    return (
        <div>
            <label className="block text-xs font-bold tracking-[0.2em] text-white/65 mb-2 uppercase">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full bg-white/5 border border-white/15 focus:border-emerald-brand rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors"
                data-testid={testid}
            />
        </div>
    );
}
