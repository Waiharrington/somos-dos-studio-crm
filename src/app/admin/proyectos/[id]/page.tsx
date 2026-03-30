"use client";

import { useState, useEffect, useCallback } from "react";
import { 
    ArrowLeft, 
    Activity, 
    Calendar, 
    User, 
    Clock, 
    CheckCircle2, 
    PauseCircle, 
    XCircle, 
    Loader2, 
    AlertTriangle,
    Rocket,
    Target,
    DollarSign,
    ExternalLink,
    Code,
    Layers,
    Layout,
    ShieldCheck,
    History
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Actions
import { getProjectByIdAction, updateTreatmentPlanAction, type PlanStatus } from "@/app/actions/plans";

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE ESTADOS
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
  installments: "Retainer Mensual",
};

// ─────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-colors">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-brand-primary transition-colors">{label}</p>
      <p className="text-xs font-black text-white tracking-tight">{value}</p>
    </div>
  );
}

function DiscoveryItem({ label, value, status, icon }: { 
  label: string; value: string; status: "ok" | "warning" | "danger" | "info"; icon: React.ReactNode 
}) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
      <div className="mt-1 text-slate-600 group-hover:text-brand-primary transition-colors">
        {icon}
      </div>
      <div className="space-y-1 flex-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold text-slate-200 leading-tight tracking-tight group-hover:text-white transition-colors">{value}</p>
          <div className={cn(
            "h-1 w-1 rounded-full flex-shrink-0 animate-pulse",
            status === "ok" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
            status === "warning" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
            status === "danger" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          )} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function ProyectoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proyecto, setProyecto] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadProyecto = useCallback(async () => {
    setIsLoading(true);
    const res = await getProjectByIdAction(id);
    if (res.success) {
      setProyecto(res.data);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) loadProyecto();
  }, [id, loadProyecto]);

  const handleUpdateStatus = async (newStatus: PlanStatus) => {
    setUpdating(true);
    const result = await updateTreatmentPlanAction(proyecto.id, proyecto.patient_id, { status: newStatus });
    setUpdating(false);
    
    if (result.success) {
      toast.success(`Estado actualizado a ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`);
      loadProyecto();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="text-brand-primary font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Sincronizando Proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-black text-white">Proyecto no encontrado</h2>
        <Link href="/admin/proyectos">
          <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-300">Volver a Proyectos</Button>
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[proyecto.status] ?? STATUS_CONFIG.active;
  const StatusIcon = config.icon;
  const progressColor =
    proyecto.progress_percentage >= 100 ? "from-emerald-500 to-emerald-400 shadow-emerald-500/20" :
    proyecto.progress_percentage >= 60  ? "from-brand-primary to-blue-500 shadow-brand-primary/20" :
    "from-slate-400 to-slate-500";

  return (
    <div className="pb-24 max-w-[1200px] mx-auto px-4 lg:px-8">
      
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand-primary/20 to-blue-500/10 border border-white/10 flex items-center justify-center text-brand-primary font-black text-2xl shadow-xl shadow-brand-primary/5">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-heading">
                {proyecto.treatment_name}
              </h1>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                  config.badgeBg, config.badgeText
                )}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  ID · {proyecto.id.split('-')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           {proyecto.status === "active" && (
             <>
               <Button
                 variant="outline"
                 disabled={updating}
                 onClick={() => handleUpdateStatus("paused")}
                 className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
               >
                 {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4 mr-2" />}
                 Pausar
               </Button>
               <Button
                 disabled={updating}
                 onClick={() => handleUpdateStatus("completed")}
                 className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-none"
               >
                 {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                 Completar
               </Button>
             </>
           )}
           {proyecto.status === "paused" && (
             <Button
               disabled={updating}
               onClick={() => handleUpdateStatus("active")}
               className="flex-1 lg:flex-none bg-brand-primary hover:bg-brand-primary/90 text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
             >
               Reactivar Desarrollo
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── COLUMNA IZQUIERDA: DETALLES PRINCIPALES ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card de Progreso */}
          <div className="glass-card p-10 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[80px]" />
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado del Desarrollo</p>
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                    {proyecto.completed_sessions} <span className="text-lg text-slate-600 font-bold uppercase tracking-widest ml-1">Fases / {proyecto.total_sessions} totales</span>
                  </h3>
                </div>
                <div className="text-5xl font-black text-brand-primary tracking-tighter">
                  {proyecto.progress_percentage}%
                </div>
              </div>

              <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proyecto.progress_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn("h-full rounded-full bg-gradient-to-r shadow-2xl transition-all duration-1000", progressColor)}
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  Próxima revisión en {proyecto.session_interval_days} días
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  Inició el {format(new Date(proyecto.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Especificaciones Técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 border-white/5 hover:border-brand-primary/20 transition-colors group">
              <div className="flex items-center gap-3 mb-6 font-black text-[10px] uppercase tracking-widest text-brand-primary opacity-60">
                <Rocket className="w-4 h-4" />
                Contexto del Proyecto
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-white tracking-tight">{proyecto.body_zone || "No especificado"}</p>
                <p className="text-xs text-slate-500">Categoría o Framework Principal</p>
              </div>
            </div>

            <div className="glass-card p-8 border-white/5 hover:border-blue-500/20 transition-colors group">
              <div className="flex items-center gap-3 mb-6 font-black text-[10px] uppercase tracking-widest text-blue-400 opacity-60">
                <DollarSign className="w-4 h-4" />
                Inversión & Billing
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-white tracking-tight">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: proyecto.currency || 'USD' }).format(proyecto.price_total || 0)}
                </p>
                <p className="text-xs text-slate-500">{PAYMENT_LABELS[proyecto.payment_type] || "Personalizado"}</p>
              </div>
            </div>
          </div>

          {/* Notas y Acuerdos */}
          <div className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8 font-black text-[10px] uppercase tracking-widest text-slate-500">
               <Activity className="w-4 h-4" />
               Acuerdos y Notas de Desarrollo
            </div>
            <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 min-h-[150px]">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {proyecto.notes || "No hay notas adicionales registradas para este proyecto."}
              </p>
            </div>
          </div>

          {/* ── SECCIÓN DE DESCUBRIMIENTO (ANÁLISIS) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-violet-500/5 to-transparent">
               <div className="flex items-center gap-3 mb-8 font-black text-[10px] uppercase tracking-widest text-violet-400">
                  <Code className="w-4 h-4" />
                  Análisis Técnico (Fase 1)
               </div>
               <div className="space-y-4">
                  <DiscoveryItem 
                    label="Base de Código" 
                    value={proyecto.patients?.has_surgeries ? (proyecto.patients.surgeries_details || "Existente / Por auditar") : "Proyecto Green-Field"} 
                    status={proyecto.patients?.has_surgeries ? "info" : "ok"}
                    icon={<History className="w-4 h-4" />}
                  />
                  <DiscoveryItem 
                    label="Ecosistema Tech" 
                    value={proyecto.patients?.has_allergies ? (proyecto.patients.allergies_details || "Propuesto por cliente") : "Definición por Estudio"} 
                    status={proyecto.patients?.has_allergies ? "info" : "warning"}
                    icon={<Layers className="w-4 h-4" />}
                  />
                  <DiscoveryItem 
                    label="Prototipos / Figma" 
                    value={proyecto.patients?.has_illnesses ? "Disponibles / Ver Enlaces" : "Sprint de Diseño Pendiente"} 
                    status={proyecto.patients?.has_illnesses ? "ok" : "warning"}
                    icon={<Layout className="w-4 h-4" />}
                  />
               </div>
            </div>

            <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
               <div className="flex items-center gap-3 mb-8 font-black text-[10px] uppercase tracking-widest text-emerald-400">
                  <Target className="w-4 h-4" />
                  Estrategia Comercial
               </div>
               <div className="space-y-4">
                  <DiscoveryItem 
                    label="Inversión Estimada" 
                    value={proyecto.patients?.smokes ? `Rango: ${proyecto.patients.smoking_amount || "Por confirmar"}` : "Presupuesto Abierto"} 
                    status={proyecto.patients?.smokes ? "ok" : "warning"}
                    icon={<DollarSign className="w-4 h-4" />}
                  />
                  <DiscoveryItem 
                    label="Benchmarking" 
                    value={proyecto.patients?.skin_routine || "Sin referencias externas"} 
                    status="info"
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                  <DiscoveryItem 
                    label="Perfil de Usuario" 
                    value={proyecto.patients?.exercise_details || "Generalista"} 
                    status="info"
                    icon={<Target className="w-4 h-4" />}
                  />
               </div>
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: CLIENTE & TIMELINE ── */}
        <div className="space-y-8">
          
          {/* Card de Cliente Vinculado */}
          <div className="glass-card p-8 border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Cliente Vinculado</p>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-xl">
                  {proyecto.patients?.first_name?.[0]}{proyecto.patients?.last_name?.[0]}
                </div>
                <div>
                  <h4 className="font-black text-white text-lg tracking-tight">
                    {proyecto.patients?.first_name} {proyecto.patients?.last_name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    EXP · {proyecto.patients?.id_number}
                  </p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-slate-500 uppercase">Teléfono</span>
                 <span className="text-xs font-bold text-white">{proyecto.patients?.phone}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-slate-500 uppercase">Email</span>
                 <span className="text-xs font-bold text-white truncate max-w-[150px]">{proyecto.patients?.email || "N/A"}</span>
              </div>
            </div>

            <Link href={`/admin/clientes/${proyecto.patient_id}`}>
              <Button variant="outline" className="w-full rounded-2xl h-14 border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">
                Ir al Perfil Completo
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Timeline de Hitos (Visitas) */}
          <div className="glass-card p-8 border-white/5 bg-gradient-to-t from-white/5 to-transparent">
            <div className="flex items-center justify-between mb-8">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bitácora de Sprints</p>
               <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-lg border border-brand-primary/20">
                 {proyecto.visits?.length || 0}
               </span>
            </div>
            
            <div className="space-y-6">
              {proyecto.visits?.length > 0 ? (
                proyecto.visits.sort((a: any, b: any) => b.session_number - a.session_number).map((visit: any, idx: number) => (
                  <div key={visit.id} className="relative pl-6 pb-2 group">
                    {/* Linea lateral */}
                    {idx < proyecto.visits.length - 1 && (
                      <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-white/5 group-hover:bg-brand-primary/20 transition-colors" />
                    )}
                    <div className="absolute left-0 top-1.5 w-[16px] h-[16px] rounded-full bg-slate-900 border-2 border-brand-primary shadow-[0_0_10px_rgba(116,39,165,0.3)] z-10" />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">Sprint #{visit.session_number}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{format(new Date(visit.visit_date + 'T12:00:00'), "d MMM yyyy", { locale: es })}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic line-clamp-2">
                        "{visit.treatment_applied}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-3 opacity-30">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sin entregas registradas</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
