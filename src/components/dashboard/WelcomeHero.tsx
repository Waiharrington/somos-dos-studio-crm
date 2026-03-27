"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import { useState, useEffect } from "react";
import { getClinicSettingsAction, type ClinicSettings } from "@/app/actions/settings";

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
      className="relative overflow-hidden rounded-[3rem] bg-white border border-brand-primary/50/50 shadow-[0_20px_50px_-20px_rgba(255,182,193,0.3)] group"
    >
      {/* Background Patterns (Abstract dots/circles) */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 border-[40px] border-brand-primary/20 rounded-full" />
        <div className="absolute -bottom-20 left-20 w-80 h-80 border-[60px] border-blue-200 rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[420px]">
        {/* Left Content */}
        <div className="flex-1 p-10 lg:p-16 space-y-8 max-w-2xl">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary/100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-xs font-black tracking-[0.2em] text-gray-400 uppercase">
                Bienvenida, {settings?.doctor_name ? (settings.doctor_name.includes("Dra.") ? settings.doctor_name : `Dra. ${settings.doctor_name}`) : "Somos Dos Studio"}
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-950 leading-[1.1] tracking-tight">
              ¿Lista para <br />
              <span className="text-transparent bg-clip-text bg-brand-primary">transformar</span> rostros hoy?
            </h1>
            
            <p className="text-gray-600 text-lg font-semibold leading-relaxed max-w-md">
              Gestiona {settings?.clinic_name || "tu estudio"} con la precisión de un cirujano y la elegancia que tus clientes merecen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-4">
            <Link href="/registro">
              <Button className="bg-brand-primary hover:shadow-2xl hover:shadow-pink-400/40 text-white rounded-2xl h-14 px-10 text-base font-bold transition-all hover:-translate-y-1 active:scale-95 border-none shadow-xl shadow-pink-200/50">
                <Plus className="w-5 h-5 mr-3" />
                Nueva Proyecto
              </Button>
            </Link>
            
            <Link href="/admin/reportes">
                <Button variant="outline" className="rounded-2xl h-14 px-8 border-brand-primary/100 text-brand-primary font-bold hover:bg-brand-primary/50 hover:border-brand-primary/200 transition-colors">
                Explorar Reportes
                </Button>
            </Link>
          </div>
        </div>

        {/* Right Image (Dra Somos Dos Studio IA) */}
        <div className="relative lg:h-[420px] w-full lg:w-[450px] flex items-end justify-center lg:justify-end pr-0 lg:pr-10 overflow-hidden lg:overflow-visible">
          {/* Círculo de fondo para la imagen */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 w-[400px] h-[400px] bg-brand-primary-soft rounded-full -z-10 blur-2xl opacity-60 animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative z-10 w-full h-full flex items-end justify-center"
          >
            <img 
              src={settings?.doctor_portrait_url || "/img/dra-Somos Dos Studio.png"} 
              alt={settings?.doctor_name || "Somos Dos Studio"} 
              className="h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
