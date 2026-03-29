"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { motion } from "framer-motion";

/* eslint-disable @next/next/no-img-element */

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const supabase = createSupabaseBrowser();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message === "Email not confirmed"
                ? "Debes confirmar tu correo electrónico en tu bandeja de entrada o en Supabase."
                : "Credenciales incorrectas. Por favor verifica.");
            setIsLoading(false);
            return;
        }

        router.push("/admin");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-brand-primary/30">
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow-purple opacity-30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] radial-glow-blue opacity-20 blur-[100px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Brand Identity */}
                <div className="text-center mb-10 space-y-4">
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl mb-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img
                            src="/logo-Somos Dos Studio.png"
                            alt="Somos Dos Studio"
                            className="h-12 object-contain drop-shadow-[0_0_15px_rgba(116,39,165,0.4)]"
                        />
                    </motion.div>
                    
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight font-heading">
                            Console Login
                        </h1>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
                            Somos Dos Studio Studio Management
                        </p>
                    </div>
                </div>

                {/* Login Terminal / Card */}
                <div className="glass-card p-10 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                User Identifier
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@somosdostudio.com"
                                    required
                                    className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl text-white placeholder:text-slate-600 focus-visible:ring-brand-primary focus-visible:border-brand-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Access Token
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="pl-12 bg-white/5 border-white/10 h-14 rounded-2xl text-white placeholder:text-slate-600 focus-visible:ring-brand-primary focus-visible:border-brand-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-500/10 text-rose-400 text-xs px-4 py-3 rounded-2xl border border-rose-500/20 font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-16 rounded-2xl shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] font-black uppercase tracking-[0.2em] text-xs mt-4"
                        >
                            {isLoading
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <span className="flex items-center gap-2">Initialize System <Sparkles className="w-4 h-4 whitespace-nowrap" /></span>
                            }
                        </Button>
                    </form>
                </div>

                <div className="text-center mt-10">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                        &copy; 2026 Somos Dos Studio &middot; Unified CRM Interface
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
