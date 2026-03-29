"use client";

import { motion } from "framer-motion";
import { Users, AlertCircle, Calendar, MessageSquare, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type StatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass?: string;
  trend?: string;
  delay?: number;
};

function StatCard({ label, value, icon, colorClass, glowClass, trend, delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "glass-card p-6 flex flex-col gap-4 group hover:scale-[1.02] transition-all duration-300",
        glowClass
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6",
          colorClass
        )}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-slate-500" />
      </div>
    </motion.div>
  );
}

export function StatsGrid({ 
  totalPatients, 
  newToday, 
  activeAlerts,
  weeklyAppointments = 0
}: { 
  totalPatients: number; 
  newToday: number; 
  activeAlerts: number;
  weeklyAppointments?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Total Clientes"
        value={totalPatients.toString()}
        icon={<Users className="w-6 h-6 text-white" />}
        colorClass="bg-gradient-to-br from-brand-primary to-purple-800"
        glowClass="hover:shadow-[0_0_30px_rgba(116,39,165,0.2)]"
        delay={0.1}
      />
      <StatCard
        label="Nuevos Hoy"
        value={newToday.toString()}
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        colorClass="bg-gradient-to-br from-brand-secondary to-blue-800"
        glowClass="hover:shadow-[0_0_30px_rgba(25,59,179,0.2)]"
        trend="Activo"
        delay={0.2}
      />
      <StatCard
        label="Seguimiento Crítico"
        value={activeAlerts.toString()}
        icon={<AlertCircle className="w-6 h-6 text-white" />}
        colorClass="bg-gradient-to-br from-rose-500 to-rose-700"
        glowClass="hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
        delay={0.3}
      />
      <StatCard
        label="Citas de la Semana"
        value={weeklyAppointments.toString()}
        icon={<Calendar className="w-6 h-6 text-white" />}
        colorClass="bg-gradient-to-br from-brand-accent to-sky-600"
        glowClass="hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]"
        trend="+15%"
        delay={0.4}
      />
    </div>
  );
}
