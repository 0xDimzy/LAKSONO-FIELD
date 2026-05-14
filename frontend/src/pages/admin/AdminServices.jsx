import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";
import api from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const EMPTY = {
    slug: "", title: "", short_desc: "", full_desc: "", icon: "Trophy",
    image: "", duration: "", starting_price: "",
    materials: [], workflow: [], features: [], order: 0,
};

export default function AdminServices() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);

    const load = () => api.get("/services").then((r) => setItems(r.data));
    useEffect(() => { load(); }, []);

    const openEdit = (s) => {
        setEditing(s);
        setForm({ ...s });
        setOpen(true);
    };
    const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                order: Number(form.order),
                materials: typeof form.materials === "string" ? form.materials.split("\n").filter(Boolean) : form.materials,
                workflow: typeof form.workflow === "string" ? form.workflow.split("\n").filter(Boolean) : form.workflow,
                features: typeof form.features === "string" ? form.features.split("\n").filter(Boolean) : form.features,
            };
            if (editing) await api.put(`/services/${editing.id}`, payload);
            else await api.post("/services", payload);
            toast.success("Saved");
            setOpen(false); load();
        } catch { toast.error("Save failed"); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this service?")) return;
        try { await api.delete(`/services/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
    };

    return (
        <div data-testid="admin-services">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tighter">Services</h1>
                    <p className="text-foreground/65 mt-1">{items.length} services available</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B132B] text-white rounded-full font-bold text-sm">
                    <Plus className="w-4 h-4" /> Add Service
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s) => (
                    <div key={s.id} className="bg-card border border-border rounded-2xl overflow-hidden" data-testid={`service-row-${s.slug}`}>
                        <div className="aspect-[16/9] overflow-hidden">
                            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                            <div className="text-[10px] font-bold tracking-widest text-emerald-brand">{s.starting_price}</div>
                            <h3 className="font-display font-bold mt-1">{s.title}</h3>
                            <p className="text-xs text-foreground/65 mt-1 line-clamp-2">{s.short_desc}</p>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => openEdit(s)} className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-foreground/5 text-xs font-bold"><Edit className="w-3 h-3" /> Edit</button>
                                <button onClick={() => remove(s.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
                    <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
                        <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
                        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
                        <Input wide label="Short Description" value={form.short_desc} onChange={(v) => setForm({ ...form, short_desc: v })} required />
                        <Input wide label="Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} required />
                        <Input label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
                        <Input label="Starting Price" value={form.starting_price} onChange={(v) => setForm({ ...form, starting_price: v })} />
                        <Input label="Icon" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
                        <Input label="Order" type="number" value={form.order} onChange={(v) => setForm({ ...form, order: v })} />
                        <div className="sm:col-span-2">
                            <Label>Full Description</Label>
                            <textarea value={form.full_desc} onChange={(e) => setForm({ ...form, full_desc: e.target.value })} rows={3} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none" />
                        </div>
                        <TextArea label="Materials (one per line)" value={Array.isArray(form.materials) ? form.materials.join("\n") : form.materials} onChange={(v) => setForm({ ...form, materials: v })} />
                        <TextArea label="Workflow (one per line)" value={Array.isArray(form.workflow) ? form.workflow.join("\n") : form.workflow} onChange={(v) => setForm({ ...form, workflow: v })} />
                        <TextArea wide label="Features (one per line)" value={Array.isArray(form.features) ? form.features.join("\n") : form.features} onChange={(v) => setForm({ ...form, features: v })} />
                        <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full border border-border font-bold text-sm">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 rounded-full bg-emerald-brand text-[#0B132B] font-bold text-sm">{editing ? "Update" : "Create"}</button>
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
function TextArea({ label, value, onChange, wide }) {
    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <Label>{label}</Label>
            <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none focus:border-emerald-brand" />
        </div>
    );
}
