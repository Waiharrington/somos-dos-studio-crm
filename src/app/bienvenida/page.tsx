"use client";

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDF4F7] flex flex-col relative overflow-hidden font-sans text-[#5D5D5D]">

      {/* --- HEADER --- */}
      <header className="w-full max-w-7xl mx-auto p-4 md:p-6 flex justify-center items-center z-20">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="relative w-40 h-16 md:w-48 md:h-20 block transition-transform hover:scale-105 active:scale-95">
            {/* Logo de Somos Dos Studio */}
            <img src="/logo-Somos Dos Studio.png" alt="Somos Dos Studio Logo" className="object-contain w-full h-full drop-shadow-sm" />
          </Link>
        </div>

        {/* Profile Pill - REMOVED */}

      </header>

      {/* --- MAIN CONTENT (CARD STYLE) --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 z-10 w-full">

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 space-y-2 mt-4 md:mt-0"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#9D4D76] tracking-tight">
            ¡Bienvenida, querida cliente!
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Por favor completa tu información para que podamos brindarte la mejor atención.
          </p>
        </motion.div>

        {/* --- ILLUSTRATION & ACTION AREA --- */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 w-full max-w-5xl justify-center">

          {/* Left: The "Clipboard" Illustration (Pure CSS/Icon) */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative scale-75 md:scale-100" // Ajuste de escala para móvil
          >
            {/* Clipboard Body */}
            <div className="w-64 h-80 bg-brand-primary/200 rounded-3xl shadow-[0_20px_40px_-10px_rgba(244,114,182,0.3)] relative flex flex-col items-center pt-12 transform rotate-[-2deg] border border-white/40">
              {/* Paper */}
              <div className="w-48 h-64 bg-white rounded-lg shadow-sm flex flex-col gap-4 p-6">
                <div className="w-12 h-12 bg-brand-primary/400 rounded-lg flex items-center justify-center text-white mb-2">
                  <span className="text-2xl font-bold">+</span>
                </div>
                {/* Lines */}
                <div className="w-full h-2 bg-brand-primary/50 rounded-full" />
                <div className="w-3/4 h-2 bg-brand-primary/50 rounded-full" />
                <div className="w-full h-2 bg-brand-primary/50 rounded-full" />
                <div className="w-5/6 h-2 bg-brand-primary/50 rounded-full" />

                {/* Check marks */}
                <div className="absolute right-8 top-28 text-brand-primary/500 transform rotate-12">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div className="absolute right-8 top-44 text-brand-primary/500 transform -rotate-12 opacity-80">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              {/* Clip */}
              <div className="absolute -top-4 w-24 h-12 bg-[#E5E0E3] rounded-t-xl rounded-b-md shadow-md border-b-4 border-[#D1CBD0]" />
            </div>
            {/* Pen decorative */}
            <div className="absolute -right-8 bottom-12 w-4 h-40 bg-gradient-to-b from-pink-300 to-pink-500 rounded-full transform rotate-[15deg] shadow-lg border-2 border-white" />
          </motion.div>

          {/* Right: Action Card/Form Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/60 w-full max-w-md"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#B34D7F]">Comenzar Registro</h2>
                <p className="text-sm text-gray-400">
                  Ingresa a nuestro asistente virtual para crear tu proyecto estudio.
                </p>
              </div>

              {/* Real Inputs */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  className="w-full h-12 bg-brand-primary/50/50 rounded-xl border border-brand-primary/200 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Motivo de Consulta"
                  className="w-full h-12 bg-brand-primary/50/50 rounded-xl border border-brand-primary/200 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
                />
              </div>

              <Link href="/registro" passHref>
                <Button
                  className="w-full bg-gradient-to-r from-[#D685A9] to-[#B34D7F] hover:from-[#C57498] hover:to-[#9D3C6B] text-white text-lg font-medium py-6 rounded-xl shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>

              {/* Link "Soy profesional" ELIMINADO */}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Decorative Gradient Orbs (Subtle) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/100/50 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[80px] -z-10 -translate-x-1/4 translate-y-1/4" />

    </div>
  );
}
