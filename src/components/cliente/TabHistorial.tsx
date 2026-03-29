"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Zap, ClipboardList, AlertCircle, CheckCircle2, XCircle, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type EquipmentParams = {
  stack?: string;
  env?: string;
  version?: string;
  notes?: string;
  [key: string]: string | undefined;
};

type Visit = {
  id: string;
  visit_date: string;
  session_number: number;
  treatment_applied: string;
  body_zones_treated: string[] | null;
  skin_condition: string | null;
  patient_complaints: string | null;
  clinical_notes: string | null;
  reaction_notes: string | null;
  results_notes: string | null;
  recommendations: string | null;
  equipment_params: EquipmentParams | null;
  next_visit_date: string | null;
  status: string;
  treatment_plans?: { treatment_name: string; total_sessions: number } | null;
};

type Props = {
  visits: Visit[];
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  completed:   { label: "Finalizado",  icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20",  text: "text-emerald-400", dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelado",   icon: XCircle,      bg: "bg-rose-500/10 border-rose-500/20",     text: "text-rose-400",   dot: "bg-rose-500" },
  no_show:     { label: "Postpuesto",  icon: AlertCircle,  bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" },
  rescheduled: { label: "Reagendado",  icon: RefreshCw,    bg: "bg-blue-500/10 border-blue-500/20",   text: "text-blue-400",  dot: "bg-blue-500" },
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export function TabHistorial({ visits }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group hover:scale-110 transition-transform">
          <Terminal className="w-10 h-10 text-slate-700 group-hover:text-brand-primary transition-colors" />
        </div>
        <div className="space-y-1">
            <p className="font-black text-white uppercase tracking-widest text-sm">Sin logs registrados</p>
            <p className="text-xs text-slate-500 max-w-xs font-medium leading-relaxed">
            Registra la primera interacción del proyecto para comenzar el historial de desarrollo.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-0 animate-in fade-in duration-700">
      {/* Línea de tiempo vertical */}
      <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-primary/40 via-brand-primary/5 to-transparent z-0" />

      {visits.map((visit, index) => {
        const isExpanded = expandedId === visit.id;
        const config = STATUS_CONFIG[visit.status] ?? STATUS_CONFIG.completed;
        const StatusIcon = config.icon;
        
        const formattedDate = format(
          new Date(visit.visit_date + "T12:00:00"),
          "d MMM yyyy",
          { locale: es }
        );
        const hasDetails = !!(
          visit.clinical_notes ||
          visit.patient_complaints ||
          visit.reaction_notes ||
          visit.results_notes ||
          visit.recommendations ||
          visit.equipment_params ||
          visit.body_zones_treated?.length
        );

        return (
          <div key={visit.id} className="relative flex gap-6 pb-6 z-10 group">

            {/* Punto de la línea de tiempo */}
            <div className="flex-shrink-0 mt-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg transition-transform group-hover:scale-110",
                visit.status === "completed"   ? "bg-brand-primary shadow-brand-primary/20"  :
                visit.status === "cancelled"   ? "bg-rose-500 shadow-rose-500/20"    :
                visit.status === "no_show"     ? "bg-amber-500 shadow-amber-500/20"  :
                "bg-blue-500 shadow-blue-500/20"
              )}>
                {visit.session_number}
              </div>
            </div>

            {/* Tarjeta de la visita */}
            <div className={cn(
                "flex-1 glass-card border-white/5 overflow-hidden transition-all duration-300",
                isExpanded ? "border-brand-primary/30 shadow-xl shadow-brand-primary/5" : "hover:border-white/10"
            )}>

              {/* Header de la tarjeta */}
              <button
                className="w-full text-left p-6 hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : visit.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base tracking-tight leading-snug font-heading group-hover:text-brand-primary transition-colors">
                      {visit.treatment_applied}
                    </p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>

                      {/* Badge de estado */}
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        config.bg, config.text
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>

                      {/* Roadmap vinculado */}
                      {visit.treatment_plans && (
                        <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/20 uppercase tracking-widest">
                          {visit.treatment_plans.treatment_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasDetails && (
                    <div className="flex-shrink-0 text-slate-700 mt-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  )}
                </div>

                {/* Preview de notas */}
                {!isExpanded && visit.clinical_notes && (
                  <p className="text-xs text-slate-500 mt-4 line-clamp-1 italic bg-white/5 p-3 rounded-xl border border-white/5">
                    "{visit.clinical_notes}"
                  </p>
                )}
              </button>

              {/* Detalle expandido */}
              {isExpanded && hasDetails && (
                <div className="border-t border-white/5 p-6 space-y-6 bg-white/[0.01]">

                  {/* Notas del Sprint */}
                  {visit.clinical_notes && (
                    <DetailSection
                      icon={<ClipboardList className="w-4 h-4" />}
                      label="Registro de Avances"
                    >
                      <p className="text-sm text-slate-300 leading-relaxed">{visit.clinical_notes}</p>
                    </DetailSection>
                  )}

                  {/* Feedback del Cliente */}
                  {visit.patient_complaints && (
                    <DetailSection label="Feedback del Cliente">
                      <p className="text-sm text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                        {visit.patient_complaints}
                      </p>
                    </DetailSection>
                  )}

                  {/* Bloqueos o Issues */}
                  {visit.reaction_notes && (
                    <DetailSection label="Alertas / Bloqueos">
                      <p className="text-sm text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 font-medium">
                        {visit.reaction_notes}
                      </p>
                    </DetailSection>
                  )}

                  {/* Log Técnico */}
                  {visit.equipment_params && Object.keys(visit.equipment_params).length > 0 && (
                    <DetailSection
                      icon={<Zap className="w-4 h-4" />}
                      label="Especificaciones Técnicas"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(visit.equipment_params).map(([key, val]) =>
                          val ? (
                            <div key={key} className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key}</p>
                              <p className="text-sm font-bold text-slate-200 mt-1">{val}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </DetailSection>
                  )}

                  {/* Próximo Check-in */}
                  {visit.next_visit_date && (
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Próximo Check-in:{" "}
                        <span className="text-white ml-2 px-3 py-1 bg-brand-primary/20 rounded-lg border border-brand-primary/30">
                          {format(new Date(visit.next_visit_date + "T12:00:00"), "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-brand-primary/60">{icon}</span>}
        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{label}</p>
      </div>
      {children}
    </div>
  );
}
