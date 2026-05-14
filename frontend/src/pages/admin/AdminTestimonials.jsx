import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";
import api from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const EMPTY = { name: "", role: "", company: "", avatar: "", message: "", rating: 5, project_type: "" };

export default function AdminTestimonials() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);

    const load = () => api.get("/testimonials").then((r) => setItems(r.data));
    useEffect(() => { load(); }, []);

    const save = async (e) => {
        e.preventDefault();
        try {
            await api.post("/testimonials", { ...form, rating: Number(form.rating) });
            toast.success("Created");
            setOpen(false); setForm(EMPTY); load();
        } catch { toast.error("Save failed"); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete?")) return;
        try { await api.delete(`/testimonials/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
    };

    return (
        <div data-testid="admin-testimonials">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tighter">Testimonials</h1>
                    <p className="text-foreground/65 mt-1">{items.length} testimonials</p>
                </div>
                <button onClick={() => { setForm(EMPTY); setOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B132B] text-white rounded-full font-bold text-sm">
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((t) => (
                    <div key={t.id} className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex gap-0.5 text-orange-brand">
                            {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="mt-3 text-sm text-foreground/80">"{t.message}"</p>
                        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-3">
                                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-sm">{t.name}</div>
                                    <div className="text-xs text-foreground/55">{t.role} · {t.company}</div>
                                </div>
                            </div>
                            <button onClick={() => remove(t.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="font-display text-2xl">New Testimonial</DialogTitle></DialogHeader>
                    <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
                        <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                        <Input label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required />
                        <Input wide label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
                        <Input wide label="Avatar URL" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} required />
                        <Input label="Project Type" value={form.project_type} onChange={(v) => setForm({ ...form, project_type: v })} />
                        <Input label="Rating (1-5)" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} required />
                        <div className="sm:col-span-2">
                            <Label>Message</Label>
                            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none focus:border-emerald-brand" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full border border-border font-bold text-sm">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 rounded-full bg-emerald-brand text-[#0B132B] font-bold text-sm">Create</button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Label({ children }) { return <label className="block text-xs font-bold tracking-[0.15em] text-foreground/65 mb-1.5 uppercase">{children}</label>; }
function Input({ label, value, onChange, type = "text", required, wide }) {
    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <Label>{label}</Label>
            <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-emerald-brand" />
        </div>
    );
}
