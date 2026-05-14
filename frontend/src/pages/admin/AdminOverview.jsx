import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, FolderKanban, MessageSquare, Newspaper, Wrench, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../../lib/api";

const COLORS = ["#06D6A0", "#FF9F1C", "#048A81", "#1C2541", "#4A4A48", "#5EE7C9"];

export default function AdminOverview() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get("/admin/overview").then((r) => setData(r.data));
    }, []);

    if (!data) return <div className="text-foreground/55">Loading...</div>;

    const cards = [
        { label: "Total Projects", value: data.totals.projects, icon: FolderKanban, color: "from-emerald-400 to-emerald-600" },
        { label: "Total Inquiries", value: data.totals.inquiries, icon: MessageSquare, color: "from-orange-400 to-orange-600" },
        { label: "New Inquiries", value: data.totals.new_inquiries, icon: TrendingUp, color: "from-blue-400 to-blue-600" },
        { label: "Blog Posts", value: data.totals.blog_posts, icon: Newspaper, color: "from-purple-400 to-purple-600" },
        { label: "Services", value: data.totals.services, icon: Wrench, color: "from-pink-400 to-pink-600" },
    ];

    return (
        <div className="space-y-6" data-testid="admin-overview">
            <div>
                <h1 className="font-display text-3xl font-black tracking-tighter">Dashboard Overview</h1>
                <p className="text-foreground/65 mt-1">Welcome back. Here's what's happening with Laksono Kontraktor.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cards.map((c, i) => (
                    <motion.div
                        key={c.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden"
                        data-testid={`stat-card-${i}`}
                    >
                        <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${c.color} opacity-10 blur-2xl`} />
                        <c.icon className="w-5 h-5 text-emerald-brand mb-3" />
                        <div className="font-display text-3xl font-black">{c.value}</div>
                        <div className="text-xs text-foreground/60 mt-1">{c.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-display font-bold text-lg">Monthly Inquiries</h3>
                            <p className="text-xs text-foreground/55">Tracking lead generation over time</p>
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-brand">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Trending
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.monthly_inquiries.length ? data.monthly_inquiries : [{ month: "No data", inquiries: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                            <YAxis tickLine={false} axisLine={false} fontSize={11} />
                            <Tooltip cursor={{ fill: "rgba(6, 214, 160, 0.05)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                            <Bar dataKey="inquiries" fill="#06D6A0" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg mb-1">By Service Type</h3>
                    <p className="text-xs text-foreground/55 mb-4">Distribution of inquiries</p>
                    {data.by_service_type.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={data.by_service_type} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {data.by_service_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-sm text-foreground/55">No inquiry data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
