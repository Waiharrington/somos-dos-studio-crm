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
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
}> = {
  active:    { label: "En Curso",    icon: <Activity className="w-3.5 h-3.5" />,     badgeBg: "bg-emerald-50 border-emerald-100",   badgeText: "text-emerald-700" },
  completed: { label: "Finalizado",  icon: <CheckCircle2 className="w-3.5 h-3.5" />, badgeBg: "bg-brand-primary/10 border-brand-primary/20", badgeText: "text-brand-primary" },
  paused:    { label: "En Pausa",    icon: <PauseCircle className="w-3.5 h-3.5" />,  badgeBg: "bg-amber-50 border-amber-100",   badgeText: "text-amber-700" },
  cancelled: { label: "Cancelado",   icon: <XCircle className="w-3.5 h-3.5" />,      badgeBg: "bg-red-50 border-red-100",       badgeText: "text-red-700" },
};

const PAYMENT_LABELS: Record<string, string> = {
  per_session:  "Hito a Hito",
  full:         "Pago Único",
  installments: "Cuotas mensuales",
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
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-700">
            {activePlans.length} Roadmap{activePlans.length !== 1 ? "s" : ""} activo
            {activePlans.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-400">{plans.length} servicios totales</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl px-6 shadow-lg shadow-brand-primary/20 text-sm gap-2 transition-all active:scale-95 border-none h-11"
        >
          <Plus className="w-4 h-4" />
          Añadir Roadmap
        </Button>
      </div>

      {/* Planes activos */}
      {activePlans.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Activos</p>
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              patientId={patientId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Planes inactivos */}
      {inactivePlans.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Proyectos</p>
          {inactivePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              patientId={patientId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-gray-500">Sin roadmaps asignados</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Asigna un roadmap para gestionar los hitos y el progreso del proyecto.
          </p>
        </div>
      )}

      {/* Modal */}
      <ModalNuevoPlan
        patientId={patientId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA DE PLAN
// ─────────────────────────────────────────────

function PlanCard({ plan, patientId, onRefresh }: {
  plan: Plan;
  patientId: string;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [updating, setUpdating]   = useState(false);
  const status = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.active;
  const sym    = CURRENCY_SYMBOLS[plan.currency] ?? "$";

  const updateStatus = async (newStatus: PlanStatus) => {
    setUpdating(true);
    const result = await updateTreatmentPlanAction(plan.id, patientId, { status: newStatus });
    setUpdating(false);
    if (result.success) {
      toast.success(`Roadmap marcado como ${STATUS_CONFIG[newStatus]?.label ?? newStatus}.`);
      onRefresh();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const progressColor =
    plan.progress_percentage >= 100 ? "bg-emerald-500" :
    plan.progress_percentage >= 60  ? "bg-brand-primary" :
    "bg-brand-primary/60";

  return (
    <div className={cn(
      "bg-white rounded-[1.5rem] border shadow-sm overflow-hidden transition-all",
      plan.status === "active" ? "border-brand-primary/20" : "border-gray-100 opacity-75"
    )}>

      {/* Header de la tarjeta */}
      <button
        className="w-full text-left p-5 hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Nombre + estado */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-800 text-sm tracking-tight">{plan.treatment_name}</h3>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                status.badgeBg, status.badgeText
              )}>
                {status.icon}
                {status.label}
              </span>
            </div>
            {plan.body_zone && (
              <p className="text-[11px] text-gray-400 mb-4 flex items-center gap-1">
                 <Rocket className="w-3 h-3" />
                 {plan.body_zone}
              </p>
            )}

            {/* Barra de progreso */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Hito {plan.completed_sessions} de {plan.total_sessions}
                </span>
                <span className={cn(
                  "font-black",
                  plan.progress_percentage >= 100 ? "text-emerald-600" : "text-brand-primary"
                )}>
                  {plan.progress_percentage}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", progressColor)}
                  style={{ width: `${Math.min(plan.progress_percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 text-gray-300 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-4 bg-gray-50/20">

          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Feedback Freq." value={`Cada ${plan.session_interval_days} días`} />
            <InfoItem label="Forma de pago" value={PAYMENT_LABELS[plan.payment_type] ?? plan.payment_type} />
            {plan.price_total && (
              <InfoItem label="Inversión total" value={`${sym} ${plan.price_total.toLocaleString()}`} />
            )}
            {plan.price_per_session && (
              <InfoItem label="Costo x Hito" value={`${sym} ${plan.price_per_session.toLocaleString()}`} />
            )}
            <InfoItem
              label="Iniciativa"
              value={format(new Date(plan.created_at), "d MMM yyyy", { locale: es })}
            />
            {plan.completed_at && (
              <InfoItem
                label={plan.status === "completed" ? "Entrega Final" : "Finalizado"}
                value={format(new Date(plan.completed_at), "d MMM yyyy", { locale: es })}
              />
            )}
          </div>

          {plan.notes && (
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 leading-relaxed italic">{plan.notes}</p>
            </div>
          )}

          {/* Acciones de estado */}
          {plan.status === "active" && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => updateStatus("paused")}
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-amber-100 text-amber-600 hover:bg-amber-50 h-9"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pausar Proy."}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => updateStatus("completed")}
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-9"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Finalizar Entregable"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => updateStatus("cancelled")}
                className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-red-100 text-red-500 hover:bg-red-50 h-9"
              >
                {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancelar"}
              </Button>
            </div>
          )}

          {plan.status === "paused" && (
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => updateStatus("active")}
              className="w-full rounded-xl text-[10px] font-black uppercase tracking-wider border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-9"
            >
              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reanudar Proyecto"}
            </Button>
          )}

        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-brand-primary/40 uppercase tracking-[0.15em] mb-0.5">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  );
}
