"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Filter,
    Loader2,
    Trash2,
    Activity,
    ExternalLink,
    DollarSign
} from "lucide-react";
import Link from "next/link";
import { getAllProjectsAction, deleteTreatmentPlanAction } from "@/app/actions/plans";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Proyecto = {
    id: string;
    treatment_name: string;
    price_total: number;
    status: string;
    created_at: string;
    patient_id: string;
    patients: {
        id: string;
        first_name: string;
        last_name: string;
        phone: string;
    };
};

export default function ProyectosPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProyectos = async () => {
            setIsLoading(true);
            const result = await getAllProjectsAction();
            if (result.success) {
                setProyectos(result.data || []);
            }
            setIsLoading(false);
        };
        fetchProyectos();
    }, []);

    const filteredProyectos = proyectos.filter(p => 
        p.treatment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patients?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patients?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteProject = async (id: string, patientId: string) => {
        if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;
        const res = await deleteTreatmentPlanAction(id, patientId);
        if (res.success) {
            toast.success("Proyecto eliminado");
            fetchProyectos();
        } else {
            toast.error("Error: " + res.error);
        }
    };

    return (
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">
            
            {/* 1. Header Premium */}
            <div className="glass-card p-10 md:p-14 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 radial-glow-blue opacity-20 -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase border border-blue-500/20">
                            Gestión de Proyectos
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight font-heading">
                            Listado de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Proyectos</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed">
                            Seguimiento global de todos los proyectos activos, presupuestos y entregas técnicas de la agencia.
                        </p>
                    </div>

                    <Link href="/registro">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 px-10 text-base font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 border-none shadow-2xl shadow-blue-600/20">
                            <Plus className="w-5 h-5 mr-3" />
                            Nuevo Proyecto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Filtros y Tabla */}
            <div className="space-y-6">
                
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-[600px] group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Buscar por servicio o cliente..."
                            className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-blue-500/50 focus-visible:bg-white/10 transition-all text-white font-bold placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <Button variant="outline" className="flex-1 lg:flex-none rounded-2xl h-16 px-8 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                <div className="glass-card overflow-hidden relative min-h-[500px]">
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-brand-dark/60 backdrop-blur-md z-20"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Cargando Proyectos...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-white/5">
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Proyecto / Servicio</th>
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Cliente</th>
                                    <th className="hidden md:table-cell px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Presupuesto</th>
                                    <th className="hidden lg:table-cell px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {!isLoading && filteredProyectos.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-40">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <Activity className="w-16 h-16 text-slate-600" />
                                                <p className="text-slate-500 font-bold tracking-tight">No se han encontrado proyectos activos.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredProyectos.map((proyecto) => (
                                    <tr key={proyecto.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
                                                    {proyecto.treatment_name?.[0] || 'P'}
                                                </div>
                                                <div className="max-w-[250px]">
                                                    <div className="font-black text-white text-sm leading-tight truncate">{proyecto.treatment_name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">ID: {proyecto.id.split('-')[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <div className="font-bold text-slate-200 text-sm">
                                                    {proyecto.patients?.first_name} {proyecto.patients?.last_name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold">{proyecto.patients?.phone}</div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-10 py-6">
                                            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                                                <DollarSign className="w-4 h-4" />
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proyecto.price_total || 0)}
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-10 py-6">
                                            <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                                                {new Date(proyecto.created_at).toLocaleDateString("es-VE", { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border shadow-lg",
                                                proyecto.status === "active" 
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-slate-500/10 text-slate-400 border-white/10"
                                            )}>
                                                {proyecto.status === 'active' ? 'En Curso' : proyecto.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/proyectos/${proyecto.id}`}>
                                                    <Button variant="ghost" title="Gestionar Proyecto" className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    title="Eliminar Proyecto"
                                                    onClick={() => handleDeleteProject(proyecto.id, proyecto.patient_id)}
                                                    className="h-10 w-10 p-0 rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
