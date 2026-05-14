import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Star } from "lucide-react";
import api from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const EMPTY = {
    title: "", category: "mini-soccer", location: "", surface_type: "", area_size: "",
    completion_year: new Date().getFullYear(), description: "",
    cover_image: "", gallery: [], before_image: "", after_image: "", featured: false, status: "completed",
};

const CATEGORIES = ["mini-soccer", "futsal", "basketball", "tennis", "volleyball", "running-track", "synthetic-grass", "acrylic-flooring", "badminton"];

export default function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);

    const load = () => api.get("/projects").then((r) => setProjects(r.data));
    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
    const openEdit = (p) => { setEditing(p); setForm({ ...p, gallery: p.gallery || [] }); setOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, completion_year: Number(form.completion_year) };
            if (editing) await api.put(`/projects/${editing.id}`, payload);
            else await api.post("/projects", payload);
            toast.success(editing ? "Project updated" : "Project created");
            setOpen(false); load();
        } catch {
            toast.error("Save failed");
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        try { await api.delete(`/projects/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
    };

    return (
        <div data-testid="admin-projects">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tighter">Projects</h1>
                    <p className="text-foreground/65 mt-1">{projects.length} project(s) total</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B132B] text-white rounded-full font-bold text-sm" data-testid="add-project">
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 text-foreground/65">
                            <tr>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Project</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Location</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Year</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 font-bold text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id} className="border-t border-border hover:bg-foreground/5">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-bold truncate">{p.title}</div>
                                                <div className="text-xs text-foreground/55 truncate">{p.surface_type}</div>
                                            </div>
                                            {p.featured && <Star className="w-3.5 h-3.5 text-orange-brand fill-orange-brand flex-shrink-0" />}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell capitalize text-foreground/75">{p.category.replace("-", " ")}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-foreground/75">{p.location}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-foreground/75">{p.completion_year}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                            p.status === "completed" ? "bg-emerald-brand/15 text-emerald-brand" :
                                            p.status === "in-progress" ? "bg-orange-brand/15 text-orange-brand" : "bg-foreground/10 text-foreground/65"
                                        }`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex gap-1">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-foreground/5" data-testid={`edit-${p.id}`}><Edit className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500" data-testid={`delete-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">{editing ? "Edit Project" : "New Project"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
                        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
                        <div>
                            <Label>Category</Label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none">
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} required />
                        <Input label="Surface Type" value={form.surface_type} onChange={(v) => setForm({ ...form, surface_type: v })} required />
                        <Input label="Area Size" value={form.area_size} onChange={(v) => setForm({ ...form, area_size: v })} required />
                        <Input label="Completion Year" type="number" value={form.completion_year} onChange={(v) => setForm({ ...form, completion_year: v })} required />
                        <Input label="Cover Image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} required wide />
                        <Input label="Before Image URL" value={form.before_image} onChange={(v) => setForm({ ...form, before_image: v })} />
                        <Input label="After Image URL" value={form.after_image} onChange={(v) => setForm({ ...form, after_image: v })} />
                        <div className="sm:col-span-2">
                            <Label>Description</Label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none" />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none">
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="planned">Planned</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 mt-7">
                            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                            <span className="text-sm font-bold">Featured Project</span>
                        </label>
                        <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full border border-border font-bold text-sm">Cancel</button>
                            <button type="submit" className="px-5 py-2.5 rounded-full bg-emerald-brand text-[#0B132B] font-bold text-sm" data-testid="save-project">{editing ? "Update" : "Create"}</button>
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
