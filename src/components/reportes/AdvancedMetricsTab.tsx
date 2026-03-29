"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, Legend, ComposedChart, Line
} from "recharts";
import { Target, DollarSign, Award, ArrowUpRight, Loader2 } from "lucide-react";
import { getTreatmentRevenueAction, getInterestConversionAction } from "@/app/actions/reports_advanced";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["#D685A9", "#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

type RevenueData = { name: string; value: number };
type ConversionData = { category: string; leads: number; conversions: number; rate: number };

export default function AdvancedMetricsTab() {
    const [revenue, setRevenue] = useState<RevenueData[]>([]);
    const [conversion, setConversion] = useState<ConversionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [revRes, convRes] = await Promise.all([
                getTreatmentRevenueAction(),
                getInterestConversionAction()
            ]);

            if (revRes.success) setRevenue(revRes.data as RevenueData[]);
            if (convRes.success) setConversion(convRes.data as ConversionData[]);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Analizando Rendimiento Comercial...</p>
            </div>
        );
    }

    const highestRevenue = revenue[0];
    const bestConversion = [...conversion].sort((a, b) => b.rate - a.rate)[0];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── TARJETAS DE INSIGHTS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary/40 to-brand-primary/10 p-8 rounded-[2.5rem] text-white border border-brand-primary/30 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:bg-white/10 transition-colors" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Servicio de Mayor Rentabilidad</p>
                            <h4 className="text-2xl font-black truncate max-w-[280px] font-heading tracking-tight mb-4">{highestRevenue?.name || "N/A"}</h4>
                            <div className="flex items-center gap-2 text-brand-primary bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-fit">
                                <DollarSign className="w-5 h-5" />
                                <span className="text-xl font-black tracking-tighter">${highestRevenue?.value.toLocaleString() || 0} USD</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <Award className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden glass-card p-8 rounded-[2.5rem] border-white/5 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -translate-y-24 translate-x-24 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Líder en Tasa de Conversión</p>
                            <h4 className="text-2xl font-black text-white truncate max-w-[280px] font-heading tracking-tight mb-4">{bestConversion?.category || "N/A"}</h4>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-black text-brand-primary tracking-tighter">{(bestConversion?.rate * 100 || 0).toFixed(0)}%</span>
                                <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                    <ArrowUpRight className="w-3.5 h-3.5 inline mr-1" /> TOP PERFORMANCE
                                </div>
                            </div>
                        </div>
                        <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center border border-brand-primary/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <Target className="w-10 h-10 text-brand-primary shadow-glow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FILA DE GRÁFICOS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Ranking de Rentabilidad */}
                <div className="glass-card p-10 border-white/5 shadow-2xl">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Escalafón de Rentabilidad</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Ingresos Brutos Acumulados por Unidad de Negocio (USD)</p>
                    </div>

                    <div className="h-[360px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenue} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.05em" }}
                                    width={120}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", fontWeight: "bold", fontSize: "12px", color: "white" }} 
                                    formatter={(v: any) => [`$${Number(v || 0).toLocaleString()} USD`, 'Ingresos Estimados']}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={26}>
                                    {revenue.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Funnel de Conversión */}
                <div className="glass-card p-10 border-white/5 shadow-2xl">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Embudo de Fidelización</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Prospectos vs Roadmaps Contractados por Categoría</p>
                    </div>

                    <div className="h-[360px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={conversion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="category"
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.05em" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", fontWeight: "bold", fontSize: "12px", color: "white" }} 
                                />
                                <Legend iconType="circle" align="right" verticalAlign="top" wrapperStyle={{ fontSize: '10px', fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: "25px", color: "#64748b" }} />
                                <Bar name="Prospectos" dataKey="leads" fill="#334155" radius={[6, 6, 0, 0]} barSize={22} />
                                <Bar name="Cierres" dataKey="conversions" fill="#D685A9" radius={[6, 6, 0, 0]} barSize={22} />
                                <Line name="Tasa %" type="monotone" dataKey={(v) => v.rate * 10} stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#0f172a' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* ── TABLA DE DETALLES ── */}
            <div className="glass-card border-white/5 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-white text-lg font-heading tracking-tight">Desglose de Conversión</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Métricas granulares por tipología de servicio</p>
                    </div>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Servicio / Categoría</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Prospectos</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Contratos</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Tasa de Éxito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {conversion.map((item, i) => (
                                <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-10 py-6 font-black text-white text-sm group-hover:text-brand-primary transition-colors">{item.category}</td>
                                    <td className="px-10 py-6 text-slate-400 font-bold text-center">{item.leads}</td>
                                    <td className="px-10 py-6 text-slate-400 font-bold text-center">{item.conversions}</td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center justify-end gap-5">
                                            <div className="w-24 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.rate * 100}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-brand-primary to-blue-500 rounded-full shadow-glow"
                                                />
                                            </div>
                                            <span className="font-black text-brand-primary text-sm tracking-tighter w-10 text-right">{(item.rate * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
