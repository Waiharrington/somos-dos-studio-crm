"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginPortalAction } from "@/app/actions/portal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Key, Mail, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    const result = await loginPortalAction(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success("¡Bienvenido a tu portal de proyectos!");
      router.push("/portal/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-brand-primary/20 rounded-3xl mb-6 border border-brand-primary/30 shadow-2xl shadow-brand-primary/10">
            <Globe className="w-10 h-10 text-brand-primary antialiased" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 font-heading">
            Client Portal
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">
            Somos Dos Studio
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[40px]" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-[0.2em] border-none mt-4"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Accediendo...</>
              ) : (
                <><ShieldCheck className="w-5 h-5 mr-3" /> Entrar al Portal</>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-10 flex flex-col items-center gap-4">
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
            Si no tienes acceso o no recuerdas tu clave, contacta a tu asesor de cuenta.
           </p>
           <div className="flex gap-4">
             <div className="h-0.5 w-6 bg-white/[0.03] rounded-full" />
             <div className="h-0.5 w-6 bg-brand-primary/20 rounded-full" />
             <div className="h-0.5 w-6 bg-white/[0.03] rounded-full" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
