"use client";

import { AlertTriangle, Activity, Calendar, Phone, Mail, MapPin, User, Code, Layout, Target, Rocket, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Cliente = {
  id: string;
  first_name: string;
  last_name: string;
  age: number | null;
  id_number: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  has_allergies: boolean; // Mapped to hasSpecificTechStack
  allergies_details: string | null; // Mapped to techStackDetails
  takes_medication: boolean; // Mapped to isUrgent
  medication_details: string | null; // Mapped to deadlineDetails
  has_illnesses: boolean; // Mapped to hasFigmaDesign
  illnesses_details: string | null; // Mapped to figmaLink
  has_surgeries: boolean; // Mapped to hasExistingCode
  surgeries_details: string | null; // Mapped to existingCodeDetails
  sun_exposure: boolean; // Mapped to mainCompetitors exists
  smokes: boolean; // Mapped to hasBudget
  smoking_amount: string | null; // Mapped to budgetRange
  skin_routine: string | null; // Mapped to mainCompetitors
};

type ActivePlan = {
  id: string;
  treatment_name: string;
  body_zone: string | null;
  total_sessions: number;
  completed_sessions: number;
  progress_percentage: number;
  session_interval_days: number;
} | null;

type LastVisit = {
  id: string;
  visit_date: string;
  treatment_applied: string;
  session_number: number;
  clinical_notes: string | null;
  next_visit_date: string | null;
} | null;

type Props = {
  patient: Cliente;
  activePlan: ActivePlan;
  lastVisit: LastVisit;
  totalSessions: number;
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export function TabResumen({ patient, activePlan, lastVisit, totalSessions }: Props) {
  const memberSince = formatDistanceToNow(new Date(patient.created_at), {
    locale: es,
    addSuffix: true,
  });

  const alerts = [
    patient.takes_medication && {
      color: "red",
      icon: <Rocket className="w-5 h-5" />,
      title: `Proyecto Urgente`,
      detail: patient.medication_details ?? "Ver detalles de entrega",
      hint: "Prioridad máxima en el roadmap del estudio.",
    },
    patient.has_illnesses && {
      color: "emerald",
      icon: <Layout className="w-5 h-5" />,
      title: "Diseño Figma Listo",
      detail: "El cliente ya cuenta con prototipos.",
      hint: "Verificar compatibilidad técnica del diseño.",
    },
    patient.has_surgeries && {
      color: "blue",
      icon: <Code className="w-5 h-5" />,
      title: "Código Existente",
      detail: patient.surgeries_details ?? "Requiere auditoría técnica",
      hint: "Analizar para posible refactorización o integración.",
    },
    patient.smokes && {
      color: "slate",
      icon: <Target className="w-5 h-5" />,
      title: "Presupuesto Definido",
      detail: patient.smoking_amount ?? "Rango por confirmar",
      hint: "Ajustar propuesta comercial al presupuesto indicado.",
    },
  ].filter(Boolean) as {
    color: string;
    icon: React.ReactNode;
    title: string;
    detail: string;
    hint: string;
  }[];

  return (
    <div className="space-y-6">

      {/* ALERTAS DE DESCUBRIMIENTO */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
            Insights de Proyecto
          </p>
          {alerts.map((alert, i) => (
            <AlertCard key={i} {...alert} />
          ))}
        </div>
      )}

      {/* STATS RÁPIDOS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value={totalSessions}
          label="Interacciones"
          color="violet"
        />
        <StatCard
          value={patient.age ?? "—"}
          label="Prioridad"
          color="emerald"
        />
        <StatCard
          value={memberSince.replace("hace ", "")}
          label="Registro"
          color="slate"
          small
        />
      </div>

      {/* PROYECTO ACTIVO (Anteriormente Plan Activo) */}
      {activePlan ? (
        <div className="bg-gradient-to-br from-brand-primary to-[#5B21B6] rounded-[2rem] p-6 text-white shadow-xl shadow-brand-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-white/80" />
            <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Proyecto Activo</p>
          </div>

          <h3 className="text-xl font-black text-white mb-1">{activePlan.treatment_name}</h3>
          {activePlan.body_zone && (
            <p className="text-sm text-white/70 mb-4">{activePlan.body_zone}</p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/80 font-semibold">
                Hito {activePlan.completed_sessions} de {activePlan.total_sessions}
              </span>
              <span className="text-white font-black">{activePlan.progress_percentage}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${activePlan.progress_percentage}%` }}
              />
            </div>
          </div>

          {activePlan.completed_sessions < activePlan.total_sessions && (
            <p className="text-xs text-white/70">
              Quedan {activePlan.total_sessions - activePlan.completed_sessions} entregables
              · Próximo check en ~{activePlan.session_interval_days} días
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-6 border-2 border-dashed border-gray-200 text-center">
          <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-semibold text-sm">Sin proyecto activo</p>
          <p className="text-gray-400 text-xs mt-1">Define el alcance para iniciar el desarrollo</p>
        </div>
      )}

      {/* ÚLTIMA INTERACCIÓN */}
      {lastVisit ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-brand-primary/40" />
            <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">
              Último Log
            </p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{lastVisit.treatment_applied}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sprint #{lastVisit.session_number} ·{" "}
                {format(new Date(lastVisit.visit_date + "T12:00:00"), "d MMM yyyy", { locale: es })}
              </p>
              {lastVisit.clinical_notes && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">
                  "{lastVisit.clinical_notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-5 border-2 border-dashed border-gray-200 text-center">
          <Calendar className="w-7 h-7 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-semibold text-sm">Sin interacciones registradas</p>
          <p className="text-gray-400 text-xs mt-1">Registra la reunión de kickoff</p>
        </div>
      )}

      {/* DATOS DE CONTACTO */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          Data de Cliente
        </p>
        <div className="space-y-3">
          <ContactRow icon={<User className="w-4 h-4" />} value={`ID · ${patient.id_number}`} />
          <ContactRow icon={<Phone className="w-4 h-4" />} value={patient.phone} />
          {patient.email && <ContactRow icon={<Mail className="w-4 h-4" />} value={patient.email} />}
          {patient.address && <ContactRow icon={<MapPin className="w-4 h-4" />} value={patient.address} />}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

const ALERT_STYLES: Record<string, { bg: string; border: string; iconBg: string; title: string; detail: string; hint: string }> = {
  red:     { bg: "bg-red-50/60",     border: "border-red-100",     iconBg: "bg-red-500",     title: "text-red-900",     detail: "text-red-700",     hint: "text-red-500/80" },
  emerald: { bg: "bg-emerald-50/60", border: "border-emerald-100", iconBg: "bg-emerald-500", title: "text-emerald-900", detail: "text-emerald-700", hint: "text-emerald-500/80" },
  blue:    { bg: "bg-blue-50/60",    border: "border-blue-100",    iconBg: "bg-blue-500",    title: "text-blue-900",    detail: "text-blue-700",    hint: "text-blue-500/80" },
  slate:   { bg: "bg-slate-50/60",   border: "border-slate-100",   iconBg: "bg-slate-500",   title: "text-slate-900",   detail: "text-slate-600",   hint: "text-slate-500/80" },
};

function AlertCard({ color, icon, title, detail, hint }: {
  color: string; icon: React.ReactNode; title: string; detail: string; hint: string;
}) {
  const s = ALERT_STYLES[color] ?? ALERT_STYLES.slate;
  return (
    <div className={cn("rounded-2xl border p-4 flex items-start gap-3", s.bg, s.border)}>
      <div className={cn("p-2 rounded-xl text-white flex-shrink-0", s.iconBg)}>
        {icon}
      </div>
      <div>
        <p className={cn("font-bold text-sm", s.title)}>{title}</p>
        <p className={cn("text-sm font-semibold mt-0.5", s.detail)}>{detail}</p>
        <p className={cn("text-xs mt-1", s.hint)}>{hint}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label, color, small }: {
  value: string | number; label: string; color: string; small?: boolean;
}) {
  const colors: Record<string, string> = {
    violet:  "from-violet-50 to-violet-100/50 text-brand-primary",
    emerald: "from-emerald-50 to-emerald-100/50 text-emerald-700",
    slate:   "from-slate-50 to-slate-100/50 text-slate-700",
  };
  return (
    <div className={cn("rounded-2xl p-4 bg-gradient-to-br text-center", colors[color] ?? colors.slate)}>
      <p className={cn("font-black", small ? "text-lg leading-tight" : "text-2xl")}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{label}</p>
    </div>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <span className="text-brand-primary/40 flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
