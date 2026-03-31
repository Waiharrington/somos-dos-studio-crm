"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPortalDataAction, logoutPortalAction } from "@/app/actions/portal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ExternalLink, 
  FolderOpen, 
  FileText, 
  Activity, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  LogOut,
  Globe,
  Layout,
  Rocket,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function PortalProyectoDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const res = await getPortalDataAction();
    if (res.success) {
      const foundProject = res.data.projects.find((p: any) => p.id === id);
      if (foundProject) {
        setProject(foundProject);
        setProfile(res.data.profile);
      } else {
        toast.error("Proyecto no encontrado.");
        router.push("/portal/dashboard");
      }
    } else {
      router.push("/portal/login");
    }
    setIsLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    const res = await logoutPortalAction();
    if (res.success) {
        toast.success("Has cerrado sesión.");
        router.push("/portal/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-b-2 border-brand-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-brand-dark/50 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/portal/dashboard" className="group flex items-center gap-4 text-slate-500 hover:text-white transition-all">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-all">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Volver al Portal</span>
          </Link>

          <div className="flex items-center gap-5">
             <div className="p-3 bg-brand-primary/20 rounded-2xl border border-brand-primary/30">
                <Globe className="w-5 h-5 text-brand-primary" />
             </div>
             <div>
                <h2 className="text-lg font-black text-white tracking-tighter leading-none">Client Portal</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                   <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" /> {profile.first_name} {profile.last_name}
                </p>
             </div>
          </div>

          <button 
             onClick={handleLogout}
             className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-brand-primary/10 transition-all border border-transparent hover:border-brand-primary/20"
          >
             <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 relative z-10 p-6 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Main Info Header */}
          <section className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
               
               <div className="space-y-8 lg:max-w-2xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                        <Activity className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{project.body_zone || "Software Dashboard"}</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[0.9] font-heading">{project.treatment_name}</h1>
                  </motion.div>

                  <div className="space-y-3">
                      <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <Rocket className="w-3.5 h-3.5 text-brand-primary" /> Progreso Real del Proyecto
                          </span>
                          <span className="text-2xl font-black text-brand-primary tracking-tighter leading-none">{project.progress_percentage}%</span>
                      </div>
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress_percentage}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-brand-primary to-blue-500 rounded-full shadow-[0_0_20px_rgba(116,39,165,0.4)]" 
                          />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right mt-2">
                        {project.completed_sessions} de {project.total_sessions} Hitos Completados
                      </p>
                  </div>
               </div>

               {/* Resources Sidebar (Large Screen) */}
               <div className="lg:w-80 space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-4">Recursos Privados</p>
                  
                  {project.drive_url ? (
                    <a href={project.drive_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <div className="glass-card p-6 border-white/5 hover:border-brand-primary/30 group transition-all flex items-center gap-4 bg-white/[0.02] hover:bg-brand-primary/[0.04]">
                            <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors">
                                <FolderOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Multimedia</p>
                                <p className="text-sm font-black text-white tracking-tight">Carpeta de Drive</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-brand-primary transition-colors" />
                        </div>
                    </a>
                  ) : (
                    <div className="glass-card p-6 border-white/5 opacity-40 grayscale flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-slate-400">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Multimedia</p>
                            <p className="text-sm font-black text-white tracking-tight">No disponible</p>
                        </div>
                    </div>
                  )}

                  {project.contract_url ? (
                    <a href={project.contract_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <div className="glass-card p-6 border-white/5 hover:border-blue-500/30 group transition-all flex items-center gap-4 bg-white/[0.02] hover:bg-blue-500/[0.04]">
                            <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Legal</p>
                                <p className="text-sm font-black text-white tracking-tight">Ver Contrato</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </a>
                  ) : (
                    <div className="glass-card p-6 border-white/5 opacity-40 grayscale flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-slate-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Legal</p>
                            <p className="text-sm font-black text-white tracking-tight">No cargado</p>
                        </div>
                    </div>
                  )}
               </div>
            </div>
          </section>

          {/* Timeline / Sprints */}
          <section className="space-y-12">
            <div className="flex items-center gap-6">
               <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Bitácora de Sprints</h2>
               <div className="h-0.5 flex-1 bg-white/[0.03] rounded-full" />
            </div>

            <div className="space-y-6">
                {project.visits && project.visits.length > 0 ? (
                    project.visits
                      .sort((a: any, b: any) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
                      .map((visit: any, index: number) => (
                        <div key={visit.id} className="relative pl-12 group">
                            {/* Vertical Line */}
                            {index !== project.visits.length - 1 && (
                                <div className="absolute left-[23px] top-10 bottom-0 w-0.5 bg-white/5 group-hover:bg-brand-primary/20 transition-colors" />
                            )}
                            
                            {/* Node Icon */}
                            <div className={cn(
                                "absolute left-0 top-0 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 z-10 bg-brand-dark group-hover:scale-110 shadow-lg shadow-black/50",
                                visit.status === 'completed' 
                                    ? "border-brand-primary/40 text-brand-primary bg-brand-primary/5" 
                                    : "border-white/10 text-slate-600 bg-white/5"
                            )}>
                                {visit.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>

                            <div className="glass-card p-8 border-white/5 hover:border-brand-primary/20 transition-all bg-white/[0.01] hover:bg-white/[0.03]">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-xl font-black text-white tracking-tight group-hover:text-brand-primary transition-colors">{visit.treatment_applied}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                            <span>Sprint #{visit.session_number}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span>{format(new Date(visit.visit_date + 'T12:00:00'), "EEEE, d 'de' MMMM yyyy", { locale: es })}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Hito Entregado</span>
                                    </div>
                                </div>

                                {visit.clinical_notes && (
                                    <div className="mt-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl border-l-[3px] border-l-brand-primary/40">
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed italic tracking-tight">
                                           "{visit.clinical_notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                      ))
                ) : (
                    <div className="glass-card p-12 border-white/5 text-center flex flex-col items-center gap-4 opacity-50">
                        <Calendar className="w-10 h-10 text-slate-700" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aún no hay hitos registrados en la bitácora</p>
                    </div>
                )}
            </div>
          </section>

        </div>
      </main>

      <footer className="p-12 border-t border-white/5 mt-12 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto flex items-center justify-between opacity-40">
             <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Somos Dos Studio &middot; Client Experience</p>
             </div>
             <p className="text-[9px] font-bold text-slate-500">v1.2.0 &middot; Portal Alpha</p>
         </div>
      </footer>
    </div>
  );
}
