"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

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
                : "Correo o contraseña incorrectos.");
            setIsLoading(false);
            return;
        }

        // Sesión establecida en el browser — el proxy podrá leer la cookie
        router.push("/admin");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F9E8F0] via-[#FDF4F7] to-[#F0D9E8] flex items-center justify-center p-4">

            {/* Blobs decorativos */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-[#D685A9]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-80 h-80 bg-[#B34D7F]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-16 bg-white rounded-2xl shadow-lg shadow-pink-200/50 mb-4">
                        <img
                            src="/logo-Somos Dos Studio.png"
                            alt="Somos Dos Studio"
                            className="h-10 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-[#9D4D76]">Bienvenida, Somos Dos Studio</h1>
                    <p className="text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 p-8 border border-brand-primary/50">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-gray-600 font-medium">
                                Correo Electrónico
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/300" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="dra.Somos Dos Studio@ejemplo.com"
                                    required
                                    autoComplete="email"
                                    className="pl-10 bg-brand-primary/50/30 border-brand-primary/100 h-11 focus-visible:ring-pink-200"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-gray-600 font-medium">
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/300" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="pl-10 bg-brand-primary/50/30 border-brand-primary/100 h-11 focus-visible:ring-pink-200"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 animate-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#D685A9] hover:bg-[#B34D7F] text-white h-11 rounded-full shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] font-semibold mt-2"
                        >
                            {isLoading
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : "Iniciar Sesión"
                            }
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Somos Dos Studio Estudio Avanzada · Sistema de gestión estudio
                </p>
            </div>
        </div>
    );
}
