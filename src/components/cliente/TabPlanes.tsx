"use client";

import { useState } from "react";
import { Plus, Activity, CheckCircle2, PauseCircle, XCircle, ChevronDown, ChevronUp, Loader2, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateTreatmentPlanAction, type PlanStatus } from "@/app/actions/plans";
import { ModalNuevoPlan } from "./ModalNuevoPlan";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Plan = {
  id: string;
  treatment_name: string;
  body_zone: string | null;
  total_sessions: number;
  session_interval_days: number;
  completed_sessions: number;
  progress_percentage: number;
  price_total: number | null;
  price_per_session: number | null;
  payment_type: string;
  currency: string;
  notes: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

type Props = {
  patientId: string;
  plans: Plan[];
  onRefresh: () => void;
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
}> = {
  active:    { label: "En Curso",    icon: Activity,     badgeBg: "bg-emerald-500/10 border-emerald-500/20",   badgeText: "text-emerald-400" },
  completed: { label: "Finalizado",  icon: CheckCircle2, badgeBg: "bg-brand-primary/10 border-brand-primary/20", badgeText: "text-brand-primary" },
  paused:    { label: "En Pausa",    icon: PauseCircle,  badgeBg: "bg-amber-500/10 border-amber-500/20",   badgeText: "text-amber-400" },
  cancelled: { label: "Cancelado",   icon: XCircle,      badgeBg: "bg-rose-500/10 border-rose-500/20",       badgeText: "text-rose-400" },
};

const PAYMENT_LABELS: Record<string, string> = {
  per_session:  "Hito a Hito",
  full:         "Pago Único",
  installments: "Cuotas mens.",
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  VES: "Bs.",
  COP: "COP$",
};

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export function TabPlanes({ patientId, plans, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);

  const activePlans    = plans.filter((p) => p.status === "active");
  const inactivePlans  = plans.filter((p) => p.status !== "active");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-xl">
        <div className="space-y-1">
          <p className="text-sm font-black text-white uppercase tracking-tight">
            {activePlans.length} Proyecto{activePlans.length !== 1 ? "s" : ""} activo{activePlans.length !== 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{plans.length} servicios totales registrados</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl px-8 h-12 shadow-xl shadow-brand-primary/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Planes activos */}
      {activePlans.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-[0.2em] ml-2">Proyectos en Desarrollo</p>
          <div className="space-y-4">
            {activePlans.map((plan) => (
                <PlanCard
                key={plan.id}
                plan={plan}
                patientId={patientId}
                onRefresh={onRefresh}
                />
            ))}
          </div>
        </div>
      )}

      {/* Planes inactivos */}
      {inactivePlans.length > 0 && (
            <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Historial de Proyectos</p>
          <div className="space-y-4">
            {inactivePlans.map((plan) => (
                <PlanCard
                key={plan.id}
                plan={plan}
                patientId={patientId}
                onRefresh={onRefresh}
                />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-slate-700 group-hover:text-brand-primary transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="font-black text-white uppercase tracking-widest text-sm">Sin proyectos asignados</p>
                <p className="text-xs text-slate-500 max-w-xs font-medium leading-relaxed">
                Asigna un proyecto para gestionar los hitos y el progreso del desarrollo.
                </p>
            </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
            <ModalNuevoPlan
                patientId={patientId}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={onRefresh}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA DE PLAN
// ─────────────────────────────────────────────

function PlanCard({ plan }: {
  plan: Plan;
}) {
  const config = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.active;
  const StatusIcon = config.icon;

  const progressColor =
    plan.progress_percentage >= 100 ? "from-emerald-500 to-emerald-400" :
    plan.progress_percentage >= 60  ? "from-brand-primary to-blue-500" :
    "from-brand-primary/60 to-brand-primary/40";

  return (
    <Link href={`/admin/proyectos/${plan.id}`}>
      <div className={cn(
        "glass-card border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-brand-primary/30 group",
        plan.status === "active" ? "border-brand-primary/20 shadow-xl shadow-brand-primary/5" : "opacity-60 grayscale hover:opacity-100 transition-all"
      )}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <h3 className="font-black text-white text-lg tracking-tight font-heading group-hover:text-brand-primary transition-colors">{plan.treatment_name}</h3>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                  config.badgeBg, config.badgeText
                )}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
              </div>
              
              {plan.body_zone && (
                <div className="flex items-center gap-2 mb-6">
                   <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
                      <Rocket className="w-3.5 h-3.5" />
                   </div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{plan.body_zone}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Fase {plan.completed_sessions} de {plan.total_sessions} completadas
                  </span>
                  <span className={cn(
                    "text-xl font-black tracking-tighter",
                    plan.progress_percentage >= 100 ? "text-emerald-400" : "text-brand-primary"
                  )}>
                    {plan.progress_percentage}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r shadow-lg", progressColor)}
                    style={{ width: `${Math.min(plan.progress_percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 text-slate-700 mt-2 self-center bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
               <ChevronDown className="w-5 h-5 -rotate-90" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-colors">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-brand-primary transition-colors">{label}</p>
      <p className="text-xs font-black text-white tracking-tight">{value}</p>
    </div>
  );
}
