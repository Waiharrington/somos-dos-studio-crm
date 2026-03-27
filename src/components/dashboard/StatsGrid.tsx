"use client";

import { motion } from "framer-motion";
import { Users, AlertCircle, Calendar, MessageSquare, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  delay?: number;
};

function StatCard({ label, value, icon, color, trend, delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 flex items-center gap-5 group hover:shadow-xl transition-all border border-white/40"
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
        color
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
          {trend && (
            <span className="flex items-center text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              {trend}
            </span>
          )}
        </div>
        <div className="text-2xl font-black text-gray-900 mt-0.5">{value}</div>
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
        label="clientes"
        value={totalPatients.toString()}
        icon={<Users className="w-5 h-5 text-brand-primary" />}
        color="bg-brand-primary/50"
        delay={0.1}
      />
      <StatCard
        label="Nuevos Hoy"
        value={newToday.toString()}
        icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
        color="bg-blue-50"
        delay={0.2}
      />
      <StatCard
        label="Alertas Médicas"
        value={activeAlerts.toString()}
        icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
        color="bg-amber-50"
        delay={0.3}
      />
      <StatCard
        label="Citas Semana"
        value={weeklyAppointments.toString()}
        icon={<Calendar className="w-5 h-5 text-purple-500" />}
        color="bg-purple-50"
        trend={weeklyAppointments > 0 ? "+"+weeklyAppointments : undefined}
        delay={0.4}
      />
    </div>
  );
}
