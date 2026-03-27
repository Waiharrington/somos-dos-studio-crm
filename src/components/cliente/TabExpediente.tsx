"use client";

import { 
  History, 
  Code, 
  Layers, 
  Activity, 
  Sun, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  Layout,
  Target,
  DollarSign,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

type Cliente = {
  // Discovery (Technical)
  has_surgeries: boolean; // hasExistingCode
  surgeries_details: string | null; // existingCodeDetails
  has_allergies: boolean; // hasSpecificTechStack
  allergies_details: string | null; // techStackDetails
  has_illnesses: boolean; // hasFigmaDesign
  illnesses_details: string | null; // figmaLink
  takes_medication: boolean; // isUrgent
  medication_details: string | null; // deadlineDetails
  
  // Scope (Business)
  smokes: boolean; // hasBudget
  smoking_amount: string | null; // budgetRange
  exercises: boolean; // isNewBusiness
  exercise_details: string | null; // targetAudience
  sun_exposure: boolean; // mainCompetitors exists
  skin_routine: string | null; // mainCompetitors
  
  // Treatment
  treatment_type: string | null;
  treatment_details: {
    discovery?: any;
    scope?: any;
    project?: { objective: string; references: string };
  } | null;
};

export function TabExpediente({ patient }: { patient: Cliente }) {
// ... (skipping lines in thinking, let's just use replace_file_content properly)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. DESCUBRIMIENTO TÉCNICO */}
      <ExpedienteCard 
        title="Descubrimiento Técnico" 
        icon={<Code className="w-5 h-5" />}
        color="violet"
      >
        <div className="space-y-4">
          <InfoItem 
            label="Código Existente" 
            value={patient.has_surgeries ? (patient.surgeries_details || "Sí, requiere auditoría") : "Proyecto desde cero"} 
            status={patient.has_surgeries ? "info" : "ok"}
            icon={<History className="w-4 h-4" />}
          />
          <InfoItem 
            label="Stack Tecnológico" 
            value={patient.has_allergies ? (patient.allergies_details || "Sugerido por cliente") : "Por definir por el estudio"} 
            status={patient.has_allergies ? "info" : "warning"}
            icon={<Layers className="w-4 h-4" />}
          />
          <InfoItem 
            label="Diseño UI/UX (Figma)" 
            value={patient.has_illnesses ? "Contratado / Link disponible" : "Pendiente por el estudio"} 
            status={patient.has_illnesses ? "ok" : "warning"}
            icon={<Layout className="w-4 h-4" />}
          />
          <InfoItem 
            label="Urgencia / Deadline" 
            value={patient.takes_medication ? (patient.medication_details || "Urgencia Alta") : "Tiempo estándar"} 
            status={patient.takes_medication ? "danger" : "ok"}
            icon={<Rocket className="w-4 h-4" />}
          />
        </div>
      </ExpedienteCard>

      {/* 2. ALCANCE Y NEGOCIO */}
      <ExpedienteCard 
        title="Alcance de Proyecto" 
        icon={<Target className="w-5 h-5" />}
        color="emerald"
      >
        <div className="space-y-4">
          <InfoItem 
            label="Presupuesto" 
            value={patient.smokes ? `Definido: ${patient.smoking_amount || "Referencial"}` : "Por negociar"} 
            status={patient.smokes ? "ok" : "warning"}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <InfoItem 
            label="Modelo de Negocio" 
            value={patient.exercises ? "Nuevo Emprendimiento" : "Escalando Negocio Existente"} 
            status="info"
            icon={<Activity className="w-4 h-4" />}
          />
          <InfoItem 
            label="Audiencia Objetivo" 
            value={patient.exercise_details || "No especificada"} 
            status="info"
            icon={<Target className="w-4 h-4" />}
          />
          <InfoItem 
            label="Competencia Directa" 
            value={patient.skin_routine || "Sin referencias"} 
            status="info"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>
      </ExpedienteCard>

      {/* 3. RESUMEN EJECUTIVO */}
      <div className="lg:col-span-2">
        <ExpedienteCard 
          title="Resumen Ejecutivo y Stack" 
          icon={<FileText className="w-5 h-5" />}
          color="slate"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Servicio Solicitado</h4>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm font-black text-gray-900 mb-1">{patient.treatment_type || "No especificado"}</p>
                <p className="text-xs text-gray-500 font-medium">Categoría principal del proyecto Somos Dos Studio.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notas de Interés</h4>
              {patient.treatment_details?.project?.objective ? (
                <p className="text-sm text-gray-600 font-medium italic leading-relaxed border-l-4 border-brand-primary pl-4 py-1">
                  &quot;{patient.treatment_details.project.objective}&quot;
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No se registraron observaciones adicionales.</p>
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
  const themes = {
    violet:  "border-violet-100 bg-white shadow-violet-100/20 icon-bg-violet-500",
    emerald: "border-emerald-100 bg-white shadow-emerald-100/20 icon-bg-emerald-500",
    slate:   "border-gray-100 bg-white shadow-gray-100/20 icon-bg-gray-500",
  };

  const iconColors = {
    violet:  "bg-brand-primary",
    emerald: "bg-emerald-500",
    slate:   "bg-gray-500",
  };

  return (
    <div className={cn(
      "rounded-[2.5rem] border p-8 shadow-xl transition-all hover:shadow-2xl",
      themes[color]
    )}>
      <div className="flex items-center gap-4 mb-8">
        <div className={cn("p-2.5 rounded-2xl text-white shadow-lg", iconColors[color])}>
          {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoItem({ label, value, status, icon }: { 
  label: string; value: string; status: "ok" | "warning" | "danger" | "info"; icon: React.ReactNode 
}) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className="mt-1 text-gray-300 group-hover:text-gray-400 transition-colors">
        {icon}
      </div>
      <div className="space-y-1.5 flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-gray-700 leading-tight">{value}</p>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse",
            status === "ok" ? "bg-emerald-400" :
            status === "warning" ? "bg-amber-400" :
            status === "danger" ? "bg-rose-400" : "bg-blue-400"
          )} />
        </div>
      </div>
    </div>
  );
}
