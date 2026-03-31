"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPortalDataAction, logoutPortalAction } from "@/app/actions/portal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  LogOut, 
  Layout, 
  ExternalLink, 
  ChevronRight, 
  FolderOpen, 
  FileText, 
  Activity,
  Clock,
  User,
  ShieldCheck,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function PortalDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const res = await getPortalDataAction();
    if (res.success) {
      setData(res.data);
    } else {
      router.push("/portal/login");
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    const res = await logoutPortalAction();
    if (res.success) {
        toast.success("Has cerrado sesión correctamente.");
        router.push("/portal/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-b-2 border-brand-primary rounded-full animate-spin" />
          <Loader2 className="w-6 h-6 text-brand-primary animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
            Sincronizando con Somos Dos...
        </p>
      </div>
    );
  }

  const { profile, projects } = data;

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans selection:bg-brand-primary/30 selection:text-brand-primary">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-brand-dark/50 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
             <div className="p-3 bg-brand-primary/20 rounded-2xl border border-brand-primary/30">
                <Globe className="w-5 h-5 text-brand-primary" />
             </div>
             <div>
                <h2 className="text-lg font-black text-white tracking-tighter leading-none">Client Portal</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5 underline decoration-brand-primary/40 decoration-2 underline-offset-4">Somos Dos Studio</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={handleLogout}
                className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-brand-primary/10 transition-all border border-transparent hover:border-brand-primary/20"
                title="Cerrar Sesión"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 p-6 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Welcome Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
            <div className="space-y-4">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-full border border-brand-primary/20"
               >
                 <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                 <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest text-center">Acceso Seguro</span>
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[0.9] font-heading"
               >
                 Hola, {profile.first_name}<span className="text-brand-primary">.</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-slate-400 font-medium max-w-sm tracking-tight"
               >
                 Bienvenido a tu panel de control. Aquí puedes ver el progreso de tus proyectos y documentos importantes.
               </motion.p>
            </div>

            <div className="flex gap-4">
               <StatBox icon={<Activity className="w-5 h-5" />} label="Proyectos" value={projects.length} />
               <StatBox icon={<User className="w-5 h-5" />} label="Estado" value={profile.status} />
            </div>
          </section>

          {/* Projects Grid */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mis Desarrollos</h2>
               <div className="h-0.5 flex-1 mx-6 bg-white/[0.03] rounded-full hidden md:block" />
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any, i: number) => (
                    <ProjectPortalCard key={project.id} project={project} index={i} />
                ))}
                </div>
            ) : (
                <div className="glass-card p-20 border-white/5 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-700 border border-white/5">
                        <FolderOpen className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-black uppercase tracking-widest">Sin proyectos activos</p>
                        <p className="text-slate-500 text-xs font-medium">Contáctanos para iniciar tu próximo gran desafío.</p>
                    </div>
                </div>
            )}
          </section>

        </div>
      </main>

      <footer className="p-12 border-t border-white/5 relative z-10 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Somos Dos Studio &middot; Premium Client Experience
            </p>
            <div className="flex gap-8">
                <a href="#" className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-brand-primary transition-colors">Términos</a>
                <a href="#" className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-brand-primary transition-colors">Privacidad</a>
            </div>
         </div>
      </footer>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="glass-card px-8 py-6 border-white/5 bg-white/[0.02] flex items-center gap-5 group hover:bg-white/[0.04] transition-colors">
            <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-all duration-500">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-white tracking-tighter leading-none">{value}</p>
            </div>
        </div>
    );
}

function ProjectPortalCard({ project, index }: { project: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
        >
            <Link href={`/portal/proyectos/${project.id}`}>
                <div className="glass-card p-10 border-white/5 hover:border-brand-primary/30 bg-gradient-to-br from-white/[0.01] to-transparent hover:from-brand-primary/[0.03] transition-all duration-700 relative overflow-hidden h-full flex flex-col group">
                    <div className="absolute top-0 right-0 w-32 h-32 radial-glow-purple opacity-0 group-hover:opacity-10 -translate-y-1/2 translate-x-1/2 blur-[40px] transition-all duration-1000" />
                    
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-lg border border-white/5 mb-6 group-hover:border-brand-primary/20 transition-all">
                                <Layout className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-primary transition-colors" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-brand-primary/80">{project.body_zone || "Software"}</span>
                            </div>
                            <h3 className="text-2xl font-black text-white group-hover:text-brand-primary tracking-tighter leading-[0.9] font-heading transition-colors">{project.treatment_name}</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progreso</span>
                                <span className="text-lg font-black text-white tracking-tighter">{project.progress_percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-brand-primary shadow-[0_0_15px_rgba(116,39,165,0.4)] transition-all duration-1000 ease-out" 
                                    style={{ width: `${project.progress_percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-brand-primary/5 transition-all">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Clock className="w-2.5 h-2.5 text-brand-primary" />Sprints
                              </p>
                              <p className="text-sm font-black text-white tracking-tight">{project.completed_sessions} / {project.total_sessions}</p>
                           </div>
                           <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 group-hover:bg-brand-primary/5 transition-all">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Activity className="w-2.5 h-2.5 text-blue-500" />Estado
                              </p>
                              <p className="text-sm font-black text-white tracking-tight uppercase">{project.status === 'active' ? 'En Curso' : project.status}</p>
                           </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-brand-primary/10 transition-colors">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Explorar Dashboard</span>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                           <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
