"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Zap, ClipboardList, AlertCircle, CheckCircle2, XCircle, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ModalNuevoSprintLog } from "./ModalNuevoSprintLog";
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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; dot: string }> = {
  completed:   { label: "Finalizado",  icon: <CheckCircle2 className="w-3.5 h-3.5" />, bg: "bg-emerald-50 border-emerald-100",  text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelado",   icon: <XCircle className="w-3.5 h-3.5" />,      bg: "bg-red-50 border-red-100",     text: "text-red-700",   dot: "bg-red-500" },
  no_show:     { label: "Postpuesto",  icon: <AlertCircle className="w-3.5 h-3.5" />,  bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  rescheduled: { label: "Reagendado",  icon: <RefreshCw className="w-3.5 h-3.5" />,    bg: "bg-blue-50 border-blue-100",   text: "text-blue-700",  dot: "bg-blue-500" },
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export function TabHistorial({ visits }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <Terminal className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-bold text-gray-500">Sin logs de sprint registrados</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Registra la primera interacción del proyecto para comenzar el historial.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Línea de tiempo vertical */}
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-primary/20 via-brand-primary/5 to-transparent z-0" />

      {visits.map((visit, index) => {
        const isExpanded = expandedId === visit.id;
        const status = STATUS_CONFIG[visit.status] ?? STATUS_CONFIG.completed;
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
          <div key={visit.id} className="relative flex gap-4 pb-5 z-10">

            {/* Punto de la línea de tiempo */}
            <div className="flex-shrink-0 mt-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm",
                visit.status === "completed"   ? "bg-brand-primary"  :
                visit.status === "cancelled"   ? "bg-red-400"    :
                visit.status === "no_show"    ? "bg-amber-400"  :
                "bg-blue-400"
              )}>
                {visit.session_number}
              </div>
            </div>

            {/* Tarjeta de la visita */}
            <div className="flex-1 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">

              {/* Header de la tarjeta */}
              <button
                className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : visit.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
                      {visit.treatment_applied}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>

                      {/* Badge de estado */}
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        status.bg, status.text
                      )}>
                        {status.icon}
                        {status.label}
                      </span>

                      {/* Roadmap vinculado */}
                      {visit.treatment_plans && (
                        <span className="text-[10px] font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">
                          {visit.treatment_plans.treatment_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasDetails && (
                    <div className="flex-shrink-0 text-gray-300 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  )}
                </div>

                {/* Preview de notas */}
                {!isExpanded && visit.clinical_notes && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                    "{visit.clinical_notes}"
                  </p>
                )}
              </button>

              {/* Detalle expandido */}
              {isExpanded && hasDetails && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">

                  {/* Notas del Sprint */}
                  {visit.clinical_notes && (
                    <DetailSection
                      icon={<ClipboardList className="w-3.5 h-3.5" />}
                      label="Notas del Sprint"
                    >
                      <p className="text-sm text-gray-700 leading-relaxed">{visit.clinical_notes}</p>
                    </DetailSection>
                  )}

                  {/* Feedback del Cliente */}
                  {visit.patient_complaints && (
                    <DetailSection label="Feedback del Cliente">
                      <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        {visit.patient_complaints}
                      </p>
                    </DetailSection>
                  )}

                  {/* Bloqueos o Issues */}
                  {visit.reaction_notes && (
                    <DetailSection label="Inconvenientes / Bloqueos">
                      <p className="text-sm text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        {visit.reaction_notes}
                      </p>
                    </DetailSection>
                  )}

                  {/* Log Técnico */}
                  {visit.equipment_params && Object.keys(visit.equipment_params).length > 0 && (
                    <DetailSection
                      icon={<Zap className="w-3.5 h-3.5" />}
                      label="Log Técnico / Entorno"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(visit.equipment_params).map(([key, val]) =>
                          val ? (
                            <div key={key} className="bg-gray-50 px-3 py-2 rounded-xl">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{key}</p>
                              <p className="text-sm font-semibold text-gray-700">{val}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </DetailSection>
                  )}

                  {/* Próximo Check-in */}
                  {visit.next_visit_date && (
                    <div className="flex items-center gap-2 pt-1">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                      <p className="text-sm font-semibold text-gray-600">
                        Próximo Check-in:{" "}
                        <span className="text-brand-primary">
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-brand-primary/40">{icon}</span>}
        <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">{label}</p>
      </div>
      {children}
    </div>
  );
}

