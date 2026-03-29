"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Plus,
    Filter,
    FileText,
    Phone,
    Loader2,
    Trash2,
    X,
    UserCircle2
} from "lucide-react";
import Link from "next/link";
import { getClientesAction, deleteClienteAction } from "@/app/actions/clientes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Cliente = {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    email?: string;
    id_number: string;
    phone: string;
    created_at: string;
    status: string;
    alert_level: number;
    treatment_type?: string;
};

export default function ClientesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

    useEffect(() => {
        const fetchClientes = async () => {
            setIsLoading(true);
            const result = await getClientesAction(searchTerm);
            if (result.success) {
                setClientes(result.data || []);
            }
            setIsLoading(false);
        };

        const timer = setTimeout(() => {
            fetchClientes();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async () => {
        if (!clienteToDelete) return;
        setIsDeleting(true);
        const result = await deleteClienteAction(clienteToDelete.id);
        if (result.success) {
            toast.success("Cliente eliminado correctamente");
            setClientes(clientes.filter(c => c.id !== clienteToDelete.id));
            setClienteToDelete(null);
        } else {
            toast.error("Error al eliminar: " + result.error);
        }
        setIsDeleting(false);
    };

    return (
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">
            
            {/* 1. Header Dinámico (Somos Dos Style) */}
            <div className="glass-card p-10 md:p-14 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 radial-glow-purple opacity-20 -translate-y-1/2 translate-x-1/2 blur-[100px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-[0.2em] uppercase border border-brand-primary/20">
                            Base de Datos Unificada
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight font-heading">
                            Gestión de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Clientes</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed">
                            Administra presupuestos, perfiles y seguimiento con la precisión tecnológica de Somos Dos Studio.
                        </p>
                    </div>

                    <Link href="/registro">
                        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 px-10 text-base font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 border-none shadow-2xl shadow-brand-primary/20">
                            <Plus className="w-5 h-5 mr-3" />
                            Nuevo Registro
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Filtros y Tabla (Estilo Tech) */}
            <div className="space-y-6">
                
                {/* Herramientas de búsqueda */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-[600px] group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nombre, identificación o contacto..."
                            className="h-16 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-brand-primary focus-visible:bg-white/10 transition-all text-white font-bold placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <Button 
                            variant="outline" 
                            className="flex-1 lg:flex-none rounded-2xl h-16 px-8 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
                            onClick={() => {
                                // @ts-expect-error - Dynamic import
                                import("@/lib/export").then(mod => mod.exportPatientsToCSV(clientes));
                            }}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                        <Button variant="outline" className="flex-1 lg:flex-none rounded-2xl h-16 px-8 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                {/* Tabla de Resultados */}
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
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                                        <div className="absolute inset-0 blur-xl bg-brand-primary/20 animate-pulse" />
                                    </div>
                                    <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Base de Datos...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-white/5">
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Identidad</th>
                                    <th className="hidden md:table-cell px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Comunicación</th>
                                    <th className="hidden lg:table-cell px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Fecha Registro</th>
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">ID/Cédula</th>
                                    <th className="hidden md:table-cell px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-10 py-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {!isLoading && clientes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-40">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <UserCircle2 className="w-16 h-16 text-slate-600" />
                                                <p className="text-slate-500 font-bold tracking-tight">No se han encontrado registros en el sistema.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-blue-500/10 border border-white/10 flex items-center justify-center text-brand-primary font-black text-lg group-hover:scale-110 transition-transform">
                                                    {cliente.first_name?.[0]}{cliente.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white text-base leading-none group-hover:text-brand-primary transition-colors">{cliente.first_name} {cliente.last_name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 mt-1.5 tracking-[0.1em] uppercase"> {cliente.treatment_type || 'PROYECTO'} </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-10 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-300 font-bold">
                                                    <Phone className="w-3.5 h-3.5 text-brand-primary" />
                                                    {cliente.phone}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{cliente.email || 'SIN EMAIL'}</div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-10 py-6">
                                            <div className="text-xs text-slate-400 font-black tracking-widest uppercase">
                                                {new Date(cliente.created_at).toLocaleDateString("es-VE", { day: '2-digit', month: 'short', year: 'numeric'})}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[10px] font-black text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 tracking-[0.1em]">
                                                {cliente.id_number}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border shadow-lg",
                                                    cliente.status === "Activo" || cliente.status === "Prospecto" || !cliente.status
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-slate-500/10 text-slate-400 border-white/10"
                                                )}>
                                                    {cliente.status || 'Activo'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/admin/clientes/${cliente.id}`}>
                                                    <Button variant="ghost" title="Ver Detalles" className="h-12 w-12 p-0 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 group-hover:scale-110 transition-all">
                                                        <FileText className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    title="Eliminar"
                                                    onClick={() => setClienteToDelete(cliente)}
                                                    className="h-12 w-12 p-0 rounded-2xl text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 group-hover:scale-110 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {/* Modal de Confirmación (Dark) */}
            <AnimatePresence>
                {clienteToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                            onClick={() => setClienteToDelete(null)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative glass rounded-[3rem] p-10 md:p-14 shadow-2xl max-w-md w-full border border-white/10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 radial-glow-blue opacity-10 -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                            
                            <button 
                                onClick={() => setClienteToDelete(null)}
                                title="Cerrar"
                                className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center gap-8 relative z-10">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/10">
                                    <Trash2 className="w-12 h-12" />
                                </div>
                                
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-white tracking-tight">¿Eliminar registro?</h3>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                                        Estás por eliminar a <span className="text-white font-black">{clienteToDelete.first_name} {clienteToDelete.last_name}</span>. 
                                        Esta operación es irreversible.
                                    </p>
                                </div>

                                <div className="flex gap-4 w-full pt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setClienteToDelete(null)}
                                        className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                                        disabled={isDeleting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        onClick={handleDelete}
                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-600/20 transition-all active:scale-95"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Borrado"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
