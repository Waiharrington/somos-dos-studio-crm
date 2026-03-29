"use client";

import { 
  History, 
  Code, 
  Layers, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Layout,
  Target,
  DollarSign,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

type Cliente = {
  // Discovery (Technical)
  has_surgeries: boolean;
  surgeries_details: string | null;
  has_allergies: boolean;
  allergies_details: string | null;
  has_illnesses: boolean;
  illnesses_details: string | null;
  takes_medication: boolean;
  medication_details: string | null;
  
  // Scope (Business)
  smokes: boolean;
  smoking_amount: string | null;
  exercises: boolean;
  exercise_details: string | null;
  sun_exposure: boolean;
  skin_routine: string | null;
  
  // Treatment
  treatment_type: string | null;
  treatment_details: {
    discovery?: Record<string, unknown>;
    scope?: Record<string, unknown>;
    project?: { objective: string; references: string };
  } | null;
};

export function TabExpediente({ patient }: { patient: Cliente }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. DESCUBRIMIENTO TÉCNICO */}
      <ExpedienteCard 
        title="Análisis Técnico" 
        icon={<Code className="w-5 h-5" />}
        color="violet"
      >
        <div className="space-y-4">
          <InfoItem 
            label="Base de Código" 
            value={patient.has_surgeries ? (patient.surgeries_details || "Existente / Por auditar") : "Proyecto Green-Field"} 
            status={patient.has_surgeries ? "info" : "ok"}
            icon={<History className="w-4 h-4" />}
          />
          <InfoItem 
            label="Ecosistema Tech" 
            value={patient.has_allergies ? (patient.allergies_details || "Propuesto por cliente") : "Definición por Estudio"} 
            status={patient.has_allergies ? "info" : "warning"}
            icon={<Layers className="w-4 h-4" />}
          />
          <InfoItem 
            label="Prototipos / Figma" 
            value={patient.has_illnesses ? "Disponibles / Ver Enlaces" : "Sprint de Diseño Pendiente"} 
            status={patient.has_illnesses ? "ok" : "warning"}
            icon={<Layout className="w-4 h-4" />}
          />
          <InfoItem 
            label="Timeframe Crítico" 
            value={patient.takes_medication ? (patient.medication_details || "Urgencia Alta") : "Tiempos Estándar"} 
            status={patient.takes_medication ? "danger" : "ok"}
            icon={<Rocket className="w-4 h-4" />}
          />
        </div>
      </ExpedienteCard>

      {/* 2. ALCANCE Y NEGOCIO */}
      <ExpedienteCard 
        title="Estrategia Comercial" 
        icon={<Target className="w-5 h-5" />}
        color="emerald"
      >
        <div className="space-y-4">
          <InfoItem 
            label="Inversión Estimada" 
            value={patient.smokes ? `Rango: ${patient.smoking_amount || "Por confirmar"}` : "Presupuesto Abierto"} 
            status={patient.smokes ? "ok" : "warning"}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <InfoItem 
            label="Naturaleza de Marca" 
            value={patient.exercises ? "Lanzamiento / Start-up" : "Escalamiento / Re-branding"} 
            status="info"
            icon={<Activity className="w-4 h-4" />}
          />
          <InfoItem 
            label="Perfil de Usuario" 
            value={patient.exercise_details || "Generalista"} 
            status="info"
            icon={<Target className="w-4 h-4" />}
          />
          <InfoItem 
            label="Benchmarking" 
            value={patient.skin_routine || "Sin referencias externas"} 
            status="info"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>
      </ExpedienteCard>

      {/* 3. RESUMEN EJECUTIVO */}
      <div className="lg:col-span-2">
        <ExpedienteCard 
          title="Resumen Estratégico" 
          icon={<FileText className="w-5 h-5" />}
          color="slate"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Solución de Diseño</h4>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 shadow-inner">
                <p className="text-lg font-black text-white mb-2 font-heading tracking-tight">{patient.treatment_type || "Proyecto Integral"}</p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Fase de descubrimiento activo dentro del roadmap de Somos Dos Studio.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objetivo del Proyecto</h4>
              {patient.treatment_details?.project?.objective ? (
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(116,39,165,0.5)]" />
                    <p className="text-base text-slate-200 font-bold italic leading-relaxed pl-6 py-1">
                    &quot;{patient.treatment_details.project.objective}&quot;
                    </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic mt-2">No se han definido objetivos específicos en la fase de descubrimiento.</p>
              )}
            </div>
          </div>
        </ExpedienteCard>
      </div>
    </div>
  );
}

function ExpedienteCard({ title, icon, color, children }: { 
  title: string; icon: React.ReactNode; color: "violet" | "emerald" | "slate"; children: React.ReactNode 
}) {
  const iconColors = {
    violet:  "bg-brand-primary shadow-brand-primary/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    slate:   "bg-slate-600 shadow-slate-600/20",
  };

  return (
    <div className="glass-card p-10 border-white/5 shadow-2xl transition-all hover:scale-[1.01] hover:border-white/10 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 radial-glow-blue opacity-5 -translate-y-1/2 translate-x-1/2 blur-[80px]" />
      
      <div className="flex items-center gap-5 mb-10 relative z-10">
        <div className={cn("p-3 rounded-2xl text-white shadow-xl transition-transform group-hover:rotate-6", iconColors[color])}>
          {icon}
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight font-heading">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function InfoItem({ label, value, status, icon }: { 
  label: string; value: string; status: "ok" | "warning" | "danger" | "info"; icon: React.ReactNode 
}) {
  return (
    <div className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
      <div className="mt-1.5 text-slate-600 group-hover:text-brand-primary transition-colors">
        {icon}
      </div>
      <div className="space-y-2 flex-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-slate-200 leading-tight tracking-tight group-hover:text-white transition-colors">{value}</p>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse ring-4 ring-offset-0",
            status === "ok" ? "bg-emerald-500 ring-emerald-500/10" :
            status === "warning" ? "bg-amber-500 ring-amber-500/10" :
            status === "danger" ? "bg-rose-500 ring-rose-500/10" : "bg-blue-500 ring-blue-500/10"
          )} />
        </div>
      </div>
    </div>
  );
}
