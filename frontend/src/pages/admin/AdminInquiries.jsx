import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, Phone, MapPin } from "lucide-react";
import api from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const STATUS_OPTIONS = ["new", "contacted", "in-progress", "closed"];

export default function AdminInquiries() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState("");

    const load = () => {
        const q = filter ? `?status=${filter}` : "";
        api.get(`/inquiries${q}`).then((r) => setItems(r.data));
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

    const updateStatus = async (id, status) => {
        try { await api.patch(`/inquiries/${id}`, { status }); toast.success("Status updated"); load(); } catch { toast.error("Failed"); }
    };

    const saveNotes = async () => {
        try {
            await api.patch(`/inquiries/${selected.id}`, { notes });
            toast.success("Notes saved");
            setSelected({ ...selected, notes });
            load();
        } catch { toast.error("Failed"); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete inquiry?")) return;
        try { await api.delete(`/inquiries/${id}`); toast.success("Deleted"); load(); setSelected(null); } catch { toast.error("Failed"); }
    };

    return (
        <div data-testid="admin-inquiries">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-black tracking-tighter">Inquiries</h1>
                    <p className="text-foreground/65 mt-1">{items.length} total inquiries</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setFilter("")} className={`px-4 py-2 rounded-full text-xs font-bold ${!filter ? "bg-foreground text-background" : "bg-card border border-border"}`}>All</button>
                    {STATUS_OPTIONS.map((s) => (
                        <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${filter === s ? "bg-foreground text-background" : "bg-card border border-border"}`}>{s.replace("-", " ")}</button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 text-foreground/65">
                            <tr>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Name</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Service</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Location</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                                <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 font-bold text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-foreground/55">No inquiries yet</td></tr>
                            )}
                            {items.map((inq) => (
                                <tr key={inq.id} className="border-t border-border hover:bg-foreground/5 cursor-pointer" onClick={() => { setSelected(inq); setNotes(inq.notes || ""); }} data-testid={`inquiry-row-${inq.id}`}>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{inq.name}</div>
                                        <div className="text-xs text-foreground/55">{inq.email}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-foreground/75">{inq.service_type}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell text-foreground/75">{inq.project_location || "—"}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-foreground/65 text-xs">{new Date(inq.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select value={inq.status} onChange={(e) => updateStatus(inq.id, e.target.value)} className="bg-background border border-border rounded-full px-3 py-1 text-xs font-bold capitalize">
                                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => remove(inq.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader><DialogTitle className="font-display text-2xl">{selected.name}</DialogTitle></DialogHeader>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-foreground/75"><Mail className="w-4 h-4 text-emerald-brand" />{selected.email}</div>
                                <div className="flex items-center gap-2 text-foreground/75"><Phone className="w-4 h-4 text-emerald-brand" />{selected.phone}</div>
                                {selected.project_location && <div className="flex items-center gap-2 text-foreground/75"><MapPin className="w-4 h-4 text-emerald-brand" />{selected.project_location}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                                <Info label="Service" value={selected.service_type} />
                                <Info label="Company" value={selected.company || "—"} />
                                <Info label="Area" value={selected.area_size || "—"} />
                                <Info label="Budget" value={selected.budget_range || "—"} />
                            </div>
                            <div>
                                <Label>Message</Label>
                                <div className="bg-secondary/50 rounded-xl p-4 text-sm">{selected.message}</div>
                            </div>
                            <div>
                                <Label>Internal Notes</Label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 outline-none resize-none focus:border-emerald-brand" />
                                <button onClick={saveNotes} className="mt-3 px-4 py-2 bg-emerald-brand text-[#0B132B] rounded-full text-xs font-bold">Save Notes</button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Label({ children }) { return <div className="text-xs font-bold tracking-[0.15em] text-foreground/65 mb-1.5 uppercase">{children}</div>; }
function Info({ label, value }) { return <div><Label>{label}</Label><div className="font-bold">{value}</div></div>; }
