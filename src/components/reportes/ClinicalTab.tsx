"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from "recharts";
import { Activity, Wind, Sun, ShieldCheck, AlertCircle, Loader2, Code2, Cpu, Globe, Lock } from "lucide-react";
import { getClinicalReportDataAction } from "@/app/actions/reports_clinical_ops";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COLORS = ["#D685A9", "#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];

export default function ClinicalTab() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getClinicalReportDataAction();
            if (res.success) setData(res.data);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Analizando Perfiles de Proyecto...</p>
            </div>
        );
    }

    // Adaptamos las métricas clínicas a conceptos de "Somos Dos Studio"
    const habitData = [
        { name: "Alta Prioridad", value: data.lifestyle.smokes, fill: "#D685A9", icon: Activity },
        { name: "Escalable", value: data.lifestyle.exercises, fill: "#6366f1", icon: Cpu },
        { name: "Internacional", value: data.lifestyle.sunExposure, fill: "#8b5cf6", icon: Globe },
        { name: "Documentado", value: data.lifestyle.usesSunscreen, fill: "#ec4899", icon: Lock },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── METRICAS DE PROYECTO ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {habitData.map((habit) => (
                    <div key={habit.name} className="glass-card p-6 border-white/5 flex flex-col items-center text-center gap-4 hover:border-brand-primary/20 transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            <habit.icon className="w-7 h-7 text-brand-primary shadow-glow" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{habit.name}</p>
                            <p className="text-3xl font-black text-white font-heading tracking-tighter">
                                {data.totalPatients > 0 ? ((habit.value / data.totalPatients) * 100).toFixed(0) : 0}%
                            </p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                {habit.value} de {data.totalPatients} proyectos
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Body Zones Distribution */}
                <div className="glass-card p-10 border-white/5 shadow-2xl">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Componentes Frecuentes</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Distribución de incidencia por módulo de desarrollo</p>
                    </div>

                    <div className="h-[360px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.bodyZones}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={6}
                                >
                                    {data.bodyZones.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                                />
                                <Legend iconType="circle" align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ fontSize: '10px', fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: "30px", color: "#64748b" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clinical Alerts Summary */}
                <div className="glass-card p-10 border-white/5 shadow-2xl flex flex-col">
                    <div className="mb-10 space-y-2">
                        <h3 className="font-black text-white text-xl font-heading tracking-tight">Análisis de Riesgos</h3>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Proyectos con requerimientos de alta complejidad</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-8">
                        <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 group relative overflow-hidden transition-all hover:bg-rose-500/15">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/20 flex items-center justify-center flex-shrink-0 border border-rose-500/30 group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-10 h-10 text-rose-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-rose-400 font-heading tracking-tighter">{data.lifestyle.allergies}</p>
                                <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em]">Puntos de Bloqueo / Riesgos</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Total Analizados</p>
                                <p className="text-3xl font-black text-white font-heading tracking-tighter">{data.totalPatients}</p>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-brand-primary/10 border border-brand-primary/20 group hover:border-brand-primary/30 transition-all">
                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3">Flujo Estándar</p>
                                <p className="text-3xl font-black text-brand-primary font-heading tracking-tighter">{data.totalPatients - data.lifestyle.allergies}</p>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-600 text-center italic mt-4 font-medium uppercase tracking-widest">
                            * Proyecciones basadas en la bitácora técnica de Somos Dos Studio.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
