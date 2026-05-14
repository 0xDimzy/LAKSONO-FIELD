import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import api from "../../lib/api";

export default function AdminSettings() {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { api.get("/settings").then((r) => setForm(r.data)); }, []);

    if (!form) return <div className="text-foreground/55">Loading...</div>;

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/settings", form);
            toast.success("Settings saved");
        } catch { toast.error("Save failed"); }
        finally { setSaving(false); }
    };

    return (
        <div data-testid="admin-settings">
            <h1 className="font-display text-3xl font-black tracking-tighter">Website Settings</h1>
            <p className="text-foreground/65 mt-1 mb-8">Configure company info, contact details, and SEO.</p>

            <form onSubmit={save} className="space-y-6 max-w-4xl">
                <Section title="Company">
                    <Input label="Company Name" value={form.company_name} onChange={update("company_name")} />
                    <Input label="Tagline" value={form.tagline} onChange={update("tagline")} wide />
                    <Input wide label="Logo URL" value={form.logo_url} onChange={update("logo_url")} />
                </Section>
                <Section title="Contact">
                    <Input label="Email" type="email" value={form.email} onChange={update("email")} />
                    <Input label="Phone" value={form.phone} onChange={update("phone")} />
                    <Input label="WhatsApp Number" value={form.whatsapp} onChange={update("whatsapp")} />
                    <Input label="Google Maps URL" value={form.google_maps} onChange={update("google_maps")} />
                    <Input wide label="Address" value={form.address} onChange={update("address")} />
                </Section>
                <Section title="Social Media">
                    <Input label="Instagram" value={form.instagram} onChange={update("instagram")} />
                    <Input label="Facebook" value={form.facebook} onChange={update("facebook")} />
                    <Input label="LinkedIn" value={form.linkedin} onChange={update("linkedin")} />
                    <Input label="YouTube" value={form.youtube} onChange={update("youtube")} />
                </Section>
                <Section title="SEO">
                    <Input wide label="SEO Title" value={form.seo_title} onChange={update("seo_title")} />
                    <Input wide label="SEO Description" value={form.seo_description} onChange={update("seo_description")} />
                </Section>

                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-brand hover:brightness-110 disabled:opacity-60 text-[#0B132B] font-bold rounded-full" data-testid="save-settings">
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </form>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-5">{title}</h3>
            <div className="grid sm:grid-cols-2 gap-4">{children}</div>
        </div>
    );
}
function Input({ label, value, onChange, type = "text", wide }) {
    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-bold tracking-[0.15em] text-foreground/65 mb-1.5 uppercase">{label}</label>
            <input type={type} value={value || ""} onChange={onChange} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-emerald-brand" />
        </div>
    );
}
