import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import api from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const EMPTY = {
    slug: "", title: "", excerpt: "", content: "", cover_image: "",
    category: "Insight", tags: [], author: "Laksono Kontraktor",
    seo_title: "", seo_description: "", published: true,
};

export default function AdminBlog() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);

    const load = () => api.get("/blog").then((r) => setItems(r.data));
    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
    const openEdit = (b) => { setEditing(b); setForm({ ...b }); setOpen(true); };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                tags: typeof form.tags === "string" ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : form.tags,
            };
            if (editing) await api.put(`/blog/${editing.id}`, payload);
            else await api.post("/blog", payload);
            toast.success("Saved");
            setOpen(false); load();
        } catch { toast.error("Save failed"); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try { await api.delete(`/blog/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
    };

    return (
        <div data-testid="admin-blog">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tighter">Blog CMS</h1>
                    <p className="text-foreground/65 mt-1">{items.length} posts</p>
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B132B] text-white rounded-full font-bold text-sm">
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((b) => (
                    <div key={b.id} className="bg-card border border-border rounded-2xl overflow-hidden" data-testid={`blog-row-${b.slug}`}>
                        <div className="aspect-[16/9] overflow-hidden">
                            <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                            <div className="text-[10px] font-bold tracking-widest text-emerald-brand">{b.category}</div>
                            <h3 className="font-display font-bold mt-1 line-clamp-2">{b.title}</h3>
                            <p className="text-xs text-foreground/65 mt-1 line-clamp-2">{b.excerpt}</p>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => openEdit(b)} className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-foreground/5 text-xs font-bold"><Edit className="w-3 h-3" /> Edit</button>
                                <button onClick={() => remove(b.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold"><Trash2 className="w-3 h-3" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
                    <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
                        <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
                        <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
                        <Input wide label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
                        <Input wide label="Excerpt" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} required />
                        <Input wide label="Cover Image URL" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v })} required />
                        <Input label="Author" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
                        <Input label="Tags (comma separated)" value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
                        <Input wide label="SEO Title" value={form.seo_title} onChange={(v) => setForm({ ...form, seo_title: v })} />
                        <Input wide label="SEO Description" value={form.seo_description} onChange={(v) => setForm({ ...form, seo_description: v })} />
                        <div className="sm:col-span-2">
                            <Label>Content</Label>
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} required className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none focus:border-emerald-brand font-mono text-sm" />
                        </div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                            <span className="text-sm font-bold">Published</span>
                        </label>
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
function Input({ label, value, onChange, required, wide }) {
    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <Label>{label}</Label>
            <input value={value || ""} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-emerald-brand" />
        </div>
    );
}
