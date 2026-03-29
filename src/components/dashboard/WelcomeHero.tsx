"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles, Rocket, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getClinicSettingsAction, type ClinicSettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

export function WelcomeHero() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getClinicSettingsAction();
      if (res.success) setSettings(res.data!);
    };
    load();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[3.5rem] bg-[#030014] border border-white/10 shadow-2xl group min-h-[460px] glass-card"
    >
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-brand-primary/20 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-full bg-gradient-to-r from-brand-secondary/10 to-transparent blur-[80px]" />
        
        {/* Animated Grid Dots */}
        <div className="absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full">
        {/* Left Content: High Impact Typography */}
        <div className="flex-1 p-10 lg:p-20 space-y-10 max-w-3xl">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 w-fit bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">
                Bienvenido de nuevo, {settings?.doctor_name || "Equipo Somos Dos"}
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight font-heading">
              ¿Listo para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-400 to-brand-secondary animate-gradient-slow">
                crear magia
              </span> hoy?
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
              Gestiona la hoja de ruta digital de tu estudio con la precisión del código y la visión de un artista.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Link href="/admin/clientes">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 px-10 text-base font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border-none shadow-[0_0_30px_rgba(116,39,165,0.4)]">
                <Plus className="w-5 h-5 mr-3" />
                Nuevo Proyecto
              </Button>
            </Link>
            
            <Link href="/admin/reportes">
                <Button variant="ghost" className="rounded-2xl h-16 px-8 text-slate-300 font-black uppercase tracking-widest hover:bg-white/5 group border border-white/5">
                  Ver Métricas
                  <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
                </Button>
            </Link>
          </div>
        </div>

        {/* Right Decorative Element: Abstract Tech Shape */}
        <div className="relative hidden lg:flex h-full w-[500px] items-center justify-center p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* The "Glow Orb" behind the illustration */}
            <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-[100px] animate-pulse" />
            
            {/* Visual placeholder for Somos Dos Studio Logo/Illustration */}
            <div className="relative z-10 w-80 h-80 glass flex items-center justify-center rounded-[3rem] border-white/20 rotate-6 hover:rotate-0 transition-transform duration-700 shadow-2xl overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Rocket className="w-32 h-32 text-brand-primary animate-float" />
               
               {/* Decorative Tech Accents */}
               <div className="absolute top-4 right-4"><Zap className="w-6 h-6 text-brand-accent opacity-50" /></div>
               <div className="absolute bottom-10 left-10 w-24 h-1 bg-brand-primary/40 rounded-full blur-sm" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
