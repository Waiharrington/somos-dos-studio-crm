"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, Legend, PieChart, Pie, AreaChart, Area, CartesianGrid
} from "recharts";
import { Clock, CalendarCheck, TrendingUp, Filter, Loader2, Zap } from "lucide-react";
import { getOperationalReportDataAction } from "@/app/actions/reports_clinical_ops";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#D685A9", "#3b82f6"];

export default function OperationalTab() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getOperationalReportDataAction();
            if (res.success) setData(res.data);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Analizando Eficiencia Logística...</p>
            </div>
        );
    }

    const totalAppts = data.effectiveness.reduce((acc: number, curr: any) => acc + curr.value, 0);
    const globalEffectiveness = (data.effectiveness.find((e: any) => e.name === "completed")?.value / (totalAppts || 1)) * 100;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── METRICAS OPERATIVAS TOP ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/40 to-indigo-500/10 p-8 rounded-[2.5rem] border border-indigo-500/30 text-white shadow-2xl group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:bg-white/10 transition-colors" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Tasa de Efectividad Global</p>
                            <h4 className="text-5xl font-black font-heading tracking-tighter mb-4">
                                {globalEffectiveness.toFixed(0)}%
                            </h4>
                            <div className="flex items-center gap-2 text-indigo-400 bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-fit">
                                <Zap className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sprints Optimizados</span>
                            </div>
                        </div>
                        <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <CalendarCheck className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden glass-card p-8 rounded-[2.5rem] border-white/5 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -translate-y-24 translate-x-24 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-3">Ventana de Máxima Productividad</p>
                            <h4 className="text-5xl font-black text-white font-heading tracking-tighter mb-4">
                                {[...data.peakHours].sort((a, b) => b.value - a.value)[0]?.hour || "N/A"}
                            </h4>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">
                                Mayor flujo de sesiones y consultas
                            </p>
                        </div>
                        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center border border-brand-primary/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <Clock className="w-12 h-12 text-brand-primary shadow-glow" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Distribución Horaria */}
                <div className="glass-card p-10 border-white/5 shadow-2xl">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Capacidad por Franja Horaria</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Carga de trabajo distribuida por horas (8:00 - 20:00)</p>
                    </div>

                    <div className="h-[360px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.05em" }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} 
                                    formatter={(val) => [val, "Sesiones"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Días de Mayor Actividad */}
                <div className="glass-card p-10 border-white/5 shadow-2xl">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Ritmo Semanal de Trabajo</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Densidad de Sprints por día de la semana</p>
                    </div>

                    <div className="h-[360px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dayActivity} margin={{ left: -20 }}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.05em" }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 10 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} 
                                />
                                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={28}>
                                    {data.dayActivity.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Effectiveness Detail Table */}
            <div className="glass-card border-white/5 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-white text-lg font-heading tracking-tight">Logística de Estados de Cita</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Control de flujo y efectividad de agenda</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-brand-primary/40 opacity-50" />
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descriptor de Estado</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Volumen</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Porcentaje de Éxito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.effectiveness.map((item: any, i: number) => {
                                const total = data.effectiveness.reduce((a: any, b: any) => a + b.value, 0);
                                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                                const statusLabels: Record<string, string> = {
                                    completed: "Completado",
                                    cancelled: "Cancelado",
                                    confirmed: "Confirmado",
                                    pending: "Pendiente"
                                };
                                return (
                                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-10 py-6 font-black text-white text-sm group-hover:text-brand-primary transition-colors">
                                            {statusLabels[item.name] || item.name}
                                        </td>
                                        <td className="px-10 py-6 text-slate-400 font-bold text-center">{item.value}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-end gap-5">
                                                <div className="w-32 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                                        className="h-full rounded-full"
                                                        style={{ 
                                                            backgroundColor: COLORS[i % COLORS.length],
                                                            boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}40`
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-black text-slate-400 text-sm tracking-tighter w-12 text-right">{percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
