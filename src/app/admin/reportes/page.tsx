"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Calendar, DollarSign, Loader2, BarChart2, PieChart as PieChartIcon, Activity } from "lucide-react";
import {
    getReportStatsAction,
    getPatientsPerMonthAction,
    getVisitsPerMonthAction,
    getTopTreatmentsAction,
} from "@/app/actions/reports";
import { cn } from "@/lib/utils";
import AdvancedMetricsTab from "@/components/reportes/AdvancedMetricsTab";
import ClinicalTab from "@/components/reportes/ClinicalTab";
import OperationalTab from "@/components/reportes/OperationalTab";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────

const PIE_COLORS = ["#D685A9", "#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981"];
const BAR_COLOR_PATIENTS = "#D685A9";
const BAR_COLOR_VISITS = "#6366f1";

type Stats = {
    totalPatients: number;
    visitsThisMonth: number;
    activePlans: number;
    totalRevenue: number;
};

type MonthData = { mes: string; total: number };
type Treatment = { name: string; value: number };

export default function ReportesPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [patients, setPatients] = useState<MonthData[]>([]);
    const [visits, setVisits] = useState<MonthData[]>([]);
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"general" | "advanced" | "clinical" | "operational">("general");

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [statsRes, patientsRes, visitsRes, treatmentsRes] = await Promise.all([
                getReportStatsAction(),
                getPatientsPerMonthAction(),
                getVisitsPerMonthAction(),
                getTopTreatmentsAction(),
            ]);

            if (statsRes.success) setStats(statsRes.data as Stats);
            if (patientsRes.success) setPatients(patientsRes.data as MonthData[]);
            if (visitsRes.success) setVisits(visitsRes.data as MonthData[]);
            if (treatmentsRes.success) setTreatments(treatmentsRes.data as Treatment[]);
            setIsLoading(false);
        };
        load();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
                <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
                <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Generando Inteligencia de Negocio...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 space-y-12 pb-24">
            
            {/* 1. Header & Tab Switcher */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 border-b border-white/5 pb-12">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/20 flex-shrink-0 animate-in zoom-in-50 duration-500">
                        <BarChart2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/20 mb-1">
                           Analíticas de Rendimiento
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none font-heading">Reportes <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">Estratégicos</span></h1>
                        <p className="text-sm text-slate-400 font-medium max-w-xl">Optimiza las operaciones de Somos Dos Studio con métricas clave y visualización de datos en tiempo real.</p>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner overflow-x-auto gap-1">
                    {[
                        { id: "general", label: "Generales", icon: PieChartIcon },
                        { id: "advanced", label: "Avanzadas", icon: TrendingUp },
                        { id: "clinical", label: "Desarrollo", icon: Activity },
                        { id: "operational", label: "Operativos", icon: Calendar }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "general" | "advanced" | "clinical" | "operational")}
                            className={cn(
                                "flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-brand-primary/40")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Content Selection */}
            <AnimatePresence mode="wait">
                {activeTab === "general" && (
                    <motion.div 
                        key="general"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<Users className="w-5 h-5" />}
                                label="Total de Clientes"
                                value={stats?.totalPatients || 0}
                                trend="+12% vs mes anterior"
                                color="purple"
                            />
                            <StatCard
                                icon={<Calendar className="w-5 h-5" />}
                                label="Sprints este Mes"
                                value={stats?.visitsThisMonth || 0}
                                trend="+5%"
                                color="blue"
                            />
                            <StatCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                label="Roadmaps Activos"
                                value={stats?.activePlans || 0}
                                trend="+8%"
                                color="emerald"
                            />
                            <StatCard
                                icon={<DollarSign className="w-5 h-5" />}
                                label="Ingresos Proyectados"
                                value={`$${stats?.totalRevenue.toLocaleString() || 0}`}
                                trend="+15%"
                                color="amber"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            <ChartCard title="Crecimiento de Cartera" subtitle="Nuevos Clientes Registros Mensuales">
                                <div className="h-[320px] w-full pt-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={patients}>
                                            <XAxis 
                                                dataKey="mes" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.1em" }} 
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                                                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", fontWeight: "bold", fontSize: "12px", color: "white" }} 
                                                itemStyle={{ color: BAR_COLOR_PATIENTS }}
                                            />
                                            <Bar dataKey="total" fill={BAR_COLOR_PATIENTS} radius={[8, 8, 8, 8]} barSize={28} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartCard>

                            <ChartCard title="Logística de Sprints" subtitle="Visitas y Sesiones Completadas">
                                <div className="h-[320px] w-full pt-8">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={visits}>
                                            <XAxis 
                                                dataKey="mes" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fontWeight: "900", fill: "#475569", letterSpacing: "0.1em" }} 
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                                                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", fontWeight: "bold", fontSize: "12px", color: "white" }} 
                                                itemStyle={{ color: BAR_COLOR_VISITS }}
                                            />
                                            <Bar dataKey="total" fill={BAR_COLOR_VISITS} radius={[8, 8, 8, 8]} barSize={28} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartCard>

                            <ChartCard title="Mix de Servicios" subtitle="Distribución por categoría de Roadmap">
                                <div className="flex flex-col items-center gap-10 pt-8">
                                    <div className="h-[240px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={treatments}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={6}
                                                >
                                                    {treatments.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "white" }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="w-full grid grid-cols-1 gap-3">
                                        {treatments.slice(0, 4).map((t, i) => (
                                            <div key={t.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[140px]">{t.name}</span>
                                                </div>
                                                <span className="font-black text-white text-xs">{t.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ChartCard>

                        </div>
                    </motion.div>
                )}

                {activeTab === "advanced" && <motion.div key="advanced" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AdvancedMetricsTab /></motion.div>}
                {activeTab === "clinical" && <motion.div key="clinical" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ClinicalTab /></motion.div>}
                {activeTab === "operational" && <motion.div key="operational" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><OperationalTab /></motion.div>}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// REFINED HELPERS
// ─────────────────────────────────────────────

function StatCard({ icon, label, value, trend, color }: { 
    icon: React.ReactNode; 
    label: string; 
    value: number | string; 
    trend?: string;
    color: "purple" | "blue" | "emerald" | "amber";
}) {
    const colors = {
        purple: "from-brand-primary/20 to-brand-primary/5 border-brand-primary/20 text-brand-primary",
        blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
        emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
        amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
    };

    return (
        <div className={cn("relative group overflow-hidden glass-card p-8 border-white/5 hover:border-white/10 transition-all duration-500 bg-gradient-to-br", colors[color])}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity" />
            
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5 text-current shadow-2xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 border border-white/5 px-3 py-1.5 rounded-xl bg-white/5">
                            {trend}
                        </span>
                    )}
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">{label}</p>
                   <p className="text-4xl font-black text-white tracking-tighter font-heading">{value}</p>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div className="glass-card p-10 border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col shadow-2xl">
            <div className="space-y-2 mb-4">
                <h3 className="font-black text-white tracking-tight text-xl font-heading">{title}</h3>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
            <div className="flex-1 flex flex-col justify-center">
               {children}
            </div>
        </div>
    );
}
