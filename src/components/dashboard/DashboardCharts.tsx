"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getDashboardAnalyticsAction } from "@/app/actions/reports";
import { Loader2 } from "lucide-react";

export function DashboardCharts() {
  const [data, setData] = useState<{
    distribution: Record<string, number>;
    weeklyGrowth: number[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getDashboardAnalyticsAction();
      if (res.success && res.data) {
        setData(res.data);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary/40 animate-spin" />
      </div>
    );
  }

  const dist = data?.distribution || {};
  const facial = dist['facial'] || 0;
  const corporal = dist['body'] || 0;
  const totalDist = (Object.values(dist).reduce((a, b) => a + b, 0)) || 1;
  
  const facialPercentage = Math.round((facial / totalDist) * 100);
  const corporalPercentage = Math.round((corporal / totalDist) * 100);
  
  // Calculate dasharray for facial
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const facialDash = (facialPercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Gráfico 1: Composición de Sesiones (Donut) */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-black text-white">Composición</h4>
            <p className="text-xs font-semibold text-slate-400">Distribución de servicios</p>
          </div>
          <button className="text-[10px] font-black tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20 uppercase">
            Detalles
          </button>
        </div>

        <div className="relative h-64 flex items-center justify-center">
          {/* SVG Donut Chart Simple */}
          <svg className="w-48 h-48 -rotate-90">
            <circle
              cx="96" cy="96" r="80"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="24"
            />
            <motion.circle
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${facialDash} ${circumference}` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="96" cy="96" r="80"
              fill="transparent"
              stroke="url(#gradient-chart)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient-chart" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7427A5" />
                <stop offset="100%" stopColor="#193BB3" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl font-black text-white tracking-tighter">{facialPercentage}%</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">Faciales / Hidratación</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faciales ({facialPercentage}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporales ({corporalPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* Gráfico 2: Evolución de clientes (Mini Bars) */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-black text-white">Evolución</h4>
            <p className="text-xs font-semibold text-slate-400">clientes nuevos esta semana</p>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-3 px-2">
          {(data?.weeklyGrowth || [0,0,0,0,0,0,0]).map((count, i) => {
            const maxCount = Math.max(...(data?.weeklyGrowth || []), 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full flex flex-col items-center group">
                  <span className="absolute -top-6 text-[10px] font-black text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={cn(
                      "w-full rounded-t-xl transition-all",
                      count > 0 ? "bg-brand-primary shadow-lg shadow-brand-primary/20" : "bg-white/5 border border-white/5"
                    )}
                  />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");
