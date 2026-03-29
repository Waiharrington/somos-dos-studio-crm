"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Calendar, AlertCircle, CheckCircle, RefreshCw, Loader2, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPendingFollowUpsAction, type FollowUp } from "@/app/actions/reminders";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export function WidgetRecordatorios() {
  const [followUps, setFollowUps]   = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    const result = await getPendingFollowUpsAction(14);
    if (result.success) setFollowUps(result.data);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const overdue  = followUps.filter((f) => f.isOverdue);
  const upcoming = followUps.filter((f) => !f.isOverdue);

  return (
    <div className="glass-card overflow-hidden border-white/10 shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary relative">
            <Bell className="w-5 h-5" />
            {followUps.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0A071E] animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-black text-white text-base tracking-tight font-heading">Recordatorios</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Seguimiento de Clientes</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all active:rotate-180 duration-500"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Body */}
      <div className="divide-y divide-white/5 bg-white/[0.02]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-[0.3em]">Sincronizando...</p>
          </div>
        ) : followUps.length === 0 ? (
          <AllClearState />
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Vencidas */}
            {overdue.length > 0 && (
              <Section
                key="overdue"
                label="Tickets Vencidos"
                icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
                items={overdue}
                variant="overdue"
              />
            )}

            {/* Próximas */}
            {upcoming.length > 0 && (
              <Section
                key="upcoming"
                label="Próximos Check-ins"
                icon={<Calendar className="w-4 h-4 text-brand-accent" />}
                items={upcoming}
                variant="upcoming"
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Link */}
      <div className="px-6 py-4 bg-white/[0.03] border-t border-white/5">
         <Link href="/admin/clientes" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-brand-primary uppercase tracking-[0.2em] transition-colors">
            Ver Todos los Clientes <ChevronRight className="w-3 h-3" />
         </Link>
      </div>
    </div>
  );
}

function Section({ label, icon, items, variant }: {
  label: string;
  icon: React.ReactNode;
  items: FollowUp[];
  variant: "overdue" | "upcoming";
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={cn(
        "flex items-center gap-3 px-6 py-3 border-y border-white/5",
        variant === "overdue" ? "bg-rose-500/5" : "bg-brand-accent/5"
      )}>
        {icon}
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.15em]",
          variant === "overdue" ? "text-rose-400" : "text-brand-accent"
        )}>
          {label}
        </span>
        <span className={cn(
          "ml-auto text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm",
          variant === "overdue" ? "bg-rose-500 text-white" : "bg-brand-accent text-white"
        )}>
          {items.length}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {items.map((f, idx) => (
          <FollowUpRow key={f.visitId} followUp={f} variant={variant} delay={idx * 0.05} />
        ))}
      </div>
    </motion.div>
  );
}

function FollowUpRow({ followUp: f, variant, delay }: { followUp: FollowUp; variant: "overdue" | "upcoming"; delay: number }) {
  const whatsappUrl = buildWhatsAppUrl(
    f.phone,
    f.patientName,
    f.treatmentApplied,
    f.nextVisitDate
  );

  const dateLabel = format(
    new Date(f.nextVisitDate + "T12:00:00"),
    "d MMM",
    { locale: es }
  );

  const dayLabel =
    f.daysUntilVisit === 0  ? "Hoy" :
    f.daysUntilVisit === 1  ? "Mañana" :
    f.daysUntilVisit === -1 ? "Ayer" :
    f.daysUntilVisit < 0    ? `Venció hace ${Math.abs(f.daysUntilVisit)} días` :
    `Inicia en ${f.daysUntilVisit} días`;

  const initials = f.patientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="group flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all duration-300"
    >
      {/* Avatar Avatar */}
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary font-black text-xs flex-shrink-0 group-hover:scale-110 transition-transform">
        {initials}
      </div>

      {/* Info Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/admin/clientes/${f.patientId}`}>
          <p className="font-bold text-slate-100 text-sm hover:text-brand-primary transition-colors truncate tracking-tight">
            {f.patientName}
          </p>
        </Link>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{f.treatmentApplied}</p>
      </div>

      {/* Date Date */}
      <div className="text-right flex-shrink-0 mr-2">
        <p className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          variant === "overdue" ? "text-rose-400" : "text-brand-accent"
        )}>
          {dayLabel}
        </p>
        <p className="text-[10px] text-slate-600 font-bold mt-0.5">{dateLabel}</p>
      </div>

      {/* Action Action */}
      {f.phone && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          title="Enviar recordatorio"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      )}
    </motion.div>
  );
}

function AllClearState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-10">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20 relative">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"
        />
      </div>
      <div className="space-y-2">
        <p className="font-black text-white text-lg font-heading">¡Sistema Optimizado!</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          No tienes tareas de seguimiento pendientes para los próximos 14 días. 
          Tu roadmap está bajo control.
        </p>
      </div>
    </div>
  );
}
