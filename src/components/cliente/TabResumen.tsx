"use client";

import { useState } from "react";
import { Activity, Calendar, Phone, Mail, MapPin, User, Code, Layout, Target, Rocket, Clock, Key, Globe, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { setClientPasswordAction } from "@/app/actions/clientes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  has_allergies: boolean; 
  allergies_details: string | null;
  takes_medication: boolean;
  medication_details: string | null;
  has_illnesses: boolean;
  illnesses_details: string | null;
  has_surgeries: boolean;
  surgeries_details: string | null;
  sun_exposure: boolean;
  smokes: boolean;
  smoking_amount: string | null;
  skin_routine: string | null;
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

  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSavePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsUpdatingPass(true);
    const result = await setClientPasswordAction(patient.id, newPassword);
    setIsUpdatingPass(false);

    if (result.success) {
      toast.success("Contraseña de acceso actualizada correctamente.");
      setNewPassword("");
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const alerts = [
    patient.takes_medication && {
      color: "red",
      icon: <Rocket className="w-5 h-5" />,
      title: `Proyecto Urgente`,
      detail: patient.medication_details ?? "Ver detalles de entrega",
      hint: "Prioridad máxima en el plan de desarrollo del estudio.",
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
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ALERTAS DE DESCUBRIMIENTO Y ACCESO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {alerts.length > 0 && (
            <>
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-[0.2em] ml-2">
                Insights Estratégicos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert, i) => (
                  <AlertCard key={i} {...alert} />
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <PortalAccessCard 
            email={patient.email || ""}
            password={newPassword}
            setPassword={setNewPassword}
            onSave={handleSavePassword}
            isUpdating={isUpdatingPass}
            showPass={showPass}
            setShowPass={setShowPass}
          />
        </div>
      </div>

      {/* PROYECTO ACTIVO */}
      {activePlan ? (
        <div className="glass-card p-8 border border-brand-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-brand-primary/20 rounded-xl text-brand-primary border border-brand-primary/30">
                    <Activity className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Proyecto Activo</p>
            </div>

            <h3 className="text-2xl font-black text-white mb-2 font-heading tracking-tight">{activePlan.treatment_name}</h3>
            {activePlan.body_zone && (
                <p className="text-sm text-slate-400 mb-8 font-medium">{activePlan.body_zone}</p>
            )}

            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso Actual</span>
                        <p className="text-sm font-black text-white">Consumo {activePlan.completed_sessions} de {activePlan.total_sessions} sesiones</p>
                    </div>
                    <span className="text-2xl font-black text-brand-primary tracking-tighter">{activePlan.progress_percentage}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                    className="h-full bg-gradient-to-r from-brand-primary to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(116,39,165,0.5)]"
                    style={{ width: `${activePlan.progress_percentage}%` }}
                />
                </div>
            </div>

            {activePlan.completed_sessions < activePlan.total_sessions && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl w-fit border border-white/10 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-brand-primary" />
                    Restan {activePlan.total_sessions - activePlan.completed_sessions} entregables · Próxima fase en ~{activePlan.session_interval_days} días
                </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 border-2 border-dashed border-white/5 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-600 border border-white/5">
            <Activity className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-black uppercase tracking-widest text-sm">Sin proyecto activo</p>
            <p className="text-slate-500 text-xs font-medium">Define el alcance para iniciar el desarrollo del proyecto.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ÚLTIMA INTERACCIÓN */}
          {lastVisit ? (
            <div className="glass-card p-8 border border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-secondary/10 rounded-xl text-brand-secondary border border-brand-secondary/20">
                        <Clock className="w-5 h-5" />
                    </div>
                <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em]">Última Bitácora</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-lg font-black text-white tracking-tight">{lastVisit.treatment_applied}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            SPRINT #{lastVisit.session_number} ·{" "}
                            {format(new Date(lastVisit.visit_date + "T12:00:00"), "d MMM yyyy", { locale: es })}
                        </p>
                    </div>
                    
                    {lastVisit.clinical_notes && (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                            "{lastVisit.clinical_notes}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="glass-card p-8 border-2 border-dashed border-white/5 text-center flex flex-col items-center justify-center gap-4">
                <Calendar className="w-8 h-8 text-slate-700" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sin interacciones registradas</p>
            </div>
          )}

          {/* DATOS DE CONTACTO */}
          <div className="glass-card p-8 border border-white/5 space-y-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Data del Cliente
            </p>
            <div className="space-y-4">
                <ContactRow icon={<User className="w-4 h-4" />} value={`ID · ${patient.id_number}`} />
                <ContactRow icon={<Phone className="w-4 h-4" />} value={patient.phone} />
                {patient.email && <ContactRow icon={<Mail className="w-4 h-4" />} value={patient.email} />}
                {patient.address && <ContactRow icon={<MapPin className="w-4 h-4" />} value={patient.address} />}
            </div>
          </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

const ALERT_STYLES: Record<string, { bg: string; border: string; iconBg: string; title: string; detail: string; hint: string }> = {
  red:     { bg: "bg-rose-500/10",    border: "border-rose-500/20",    iconBg: "bg-rose-500",    title: "text-white",     detail: "text-rose-200",    hint: "text-rose-500/80" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", iconBg: "bg-emerald-500", title: "text-white",     detail: "text-emerald-200", hint: "text-emerald-500/80" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    iconBg: "bg-blue-500",    title: "text-white",     detail: "text-blue-200",    hint: "text-blue-500/80" },
  slate:   { bg: "bg-slate-500/10",   border: "border-slate-500/20",   iconBg: "bg-slate-500",   title: "text-white",     detail: "text-slate-300",   hint: "text-slate-500/80" },
};

function AlertCard({ color, icon, title, detail, hint }: {
  color: string; icon: React.ReactNode; title: string; detail: string; hint: string;
}) {
  const s = ALERT_STYLES[color] ?? ALERT_STYLES.slate;
  return (
    <div className={cn("rounded-2xl border p-5 flex items-start gap-4 transition-all hover:scale-[1.02]", s.bg, s.border)}>
      <div className={cn("p-2.5 rounded-xl text-white flex-shrink-0 shadow-lg", s.iconBg)}>
        {icon}
      </div>
      <div>
        <p className={cn("font-black text-sm tracking-tight", s.title)}>{title}</p>
        <p className={cn("text-xs font-bold mt-1 opacity-90", s.detail)}>{detail}</p>
        <p className={cn("text-[9px] font-black uppercase tracking-widest mt-2", s.hint)}>{hint}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label, color, small }: {
  value: string | number; label: string; color: string; small?: boolean;
}) {
  const colors: Record<string, string> = {
    violet:  "from-brand-primary/20 to-brand-primary/5 text-brand-primary border-brand-primary/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
    slate:   "from-slate-500/20 to-slate-500/5 text-slate-400 border-white/10",
  };
  return (
    <div className={cn("rounded-[2rem] p-6 bg-gradient-to-br text-center border transition-all hover:-translate-y-1", colors[color] ?? colors.slate)}>
      <p className={cn("font-black tracking-tighter", small ? "text-lg leading-tight" : "text-3xl")}>{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50">{label}</p>
    </div>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-4 text-slate-300 group cursor-default">
      <span className="text-brand-primary/40 flex-shrink-0 bg-white/5 p-2 rounded-lg border border-white/5 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all">{icon}</span>
      <span className="text-sm font-bold tracking-tight">{value}</span>
    </div>
  );
}

function PortalAccessCard({ 
  email, 
  onSave, 
  isUpdating, 
  password, 
  setPassword, 
  showPass, 
  setShowPass 
}: { 
  email: string; 
  onSave: () => void; 
  isUpdating: boolean; 
  password: string; 
  setPassword: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
}) {
  return (
    <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-brand-primary/5 to-transparent relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 w-32 h-32 radial-glow-purple opacity-10 -translate-y-1/2 translate-x-1/2 blur-[40px]" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-brand-primary/20 rounded-xl text-brand-primary group-hover:rotate-6 transition-all border border-brand-primary/20 shadow-lg shadow-brand-primary/10">
          <Key className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white tracking-tight leading-none font-heading">Acceso al Portal</h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Clave del cliente</p>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Correo</p>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-all">
              <Mail className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-xs font-bold text-white truncate">{email || "Sin correo"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Clave</p>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 chars"
                className="w-full h-11 bg-white/5 rounded-xl border border-white/10 px-4 text-xs font-bold text-white tracking-tight focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary transition-all outline-none"
              />
              <button 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={onSave}
            disabled={isUpdating || !password || !email}
            className="w-full h-11 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-brand-primary/10 border-none"
          >
            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Globe className="w-3.5 h-3.5 mr-2" />}
            Guardar
          </Button>
          
          <p className="text-[8px] text-center text-slate-600 font-medium leading-tight">
            * Acceso en <span className="text-brand-primary">/portal</span>
          </p>
        </div>
      </div>
    </div>
  );
}
