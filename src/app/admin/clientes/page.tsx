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
    AlertTriangle,
    Trash2,
    X
} from "lucide-react";
import Link from "next/link";
import { getClientesAction, deleteClienteAction } from "@/app/actions/clientes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
        <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. Dynamic Header */}
            <div className="relative overflow-hidden rounded-[3rem] bg-white border border-brand-primary/20 shadow-xl p-10 md:p-14 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-[0.2em] uppercase border border-brand-primary/20">
                            Base de Datos
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tight leading-tight">
                            Gestión de <br />
                            <span className="text-transparent bg-clip-text bg-brand-primary">Clientes</span>
                        </h1>
                        <p className="text-gray-600 font-semibold max-w-md">
                            Administra proyectos activos y perfiles con la precisión y elegancia de Somos Dos Studio.
                        </p>
                    </div>

                    <Link href="/registro">
                        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-[1.5rem] h-14 px-10 text-base font-bold transition-all hover:-translate-y-1 active:scale-95 border-none shadow-xl shadow-brand-primary/20">
                            <Plus className="w-5 h-5 mr-3" />
                            Nuevo Proyecto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Controls & Table */}
            <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl">
                
                {/* Search & Actions Bar */}
                <div className="p-6 md:p-10 border-b border-gray-100 bg-white/40 backdrop-blur-md flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full lg:w-[500px] group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                        <Input
                            placeholder="Buscar por nombre, email o identificación..."
                            className="h-14 pl-14 pr-6 bg-gray-50 border-transparent rounded-[1.5rem] focus-visible:ring-brand-primary focus-visible:bg-white transition-all shadow-sm text-base font-bold placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <Button 
                            variant="outline" 
                            className="flex-1 lg:flex-none rounded-2xl h-12 px-6 border-gray-200 text-gray-500 hover:bg-brand-primary/5 hover:text-brand-primary font-bold transition-all"
                            onClick={() => {
                                // @ts-expect-error - Dynamic import
                                import("@/lib/export").then(mod => mod.exportPatientsToCSV(clientes));
                            }}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                        <Button variant="outline" className="flex-1 lg:flex-none rounded-2xl h-12 px-6 border-gray-200 text-gray-500 hover:bg-brand-primary/5 font-bold transition-all">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="p-2 md:p-6 relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-20">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                                <p className="text-brand-primary font-black text-xs uppercase tracking-widest animate-pulse">Consultando Registros...</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-[2rem]">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em]">Cliente</th>
                                    <th className="hidden md:table-cell px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em]">Contacto</th>
                                    <th className="hidden lg:table-cell px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em]">F. Registro</th>
                                    <th className="px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em]">ID</th>
                                    <th className="hidden md:table-cell px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em]">Estado</th>
                                    <th className="px-8 py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.1em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {!isLoading && clientes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-32">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-50 rounded-full">
                                                    <Search className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-bold">No encontramos clientes registrados.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id} className="group hover:bg-gray-50/80 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 border-2 border-white shadow-sm flex items-center justify-center text-brand-primary font-black group-hover:scale-110 transition-transform">
                                                    {cliente.first_name?.[0]}{cliente.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 leading-tight group-hover:text-brand-primary transition-colors">{cliente.first_name} {cliente.last_name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-wider uppercase"> {cliente.treatment_type || 'PROYECTO'} </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {cliente.phone}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">{cliente.email || '—'}</div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-8 py-5">
                                            <div className="text-sm text-gray-600 font-black tracking-tighter">
                                                {new Date(cliente.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-xl border border-brand-primary/10">
                                                {cliente.id_number}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-sm",
                                                    cliente.status === "Activo" || cliente.status === "Prospecto" || !cliente.status
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-gray-50 text-gray-500 border-gray-200"
                                                )}>
                                                    {cliente.status || 'Activo'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/clientes/${cliente.id}`}>
                                                    <Button variant="ghost" title="Ver Detalles" className="h-10 w-10 p-0 rounded-2xl text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 group-hover:scale-110 transition-all">
                                                        <FileText className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    title="Eliminar"
                                                    onClick={() => setClienteToDelete(cliente)}
                                                    className="h-10 w-10 p-0 rounded-2xl text-gray-300 hover:text-red-500 hover:bg-red-50 group-hover:scale-110 transition-all"
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

            {/* Confirmation Modal */}
            {clienteToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setClienteToDelete(null)} />
                    <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 border border-gray-100">
                        <button 
                            onClick={() => setClienteToDelete(null)}
                            title="Cerrar"
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">¿Eliminar registro?</h3>
                                <p className="text-gray-500 font-medium">
                                    Estás por eliminar a <span className="text-brand-primary font-bold">{clienteToDelete.first_name} {clienteToDelete.last_name}</span>. 
                                    Esta acción es irreversible y borrará todo su historial.
                                </p>
                            </div>

                            <div className="flex gap-4 w-full pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setClienteToDelete(null)}
                                    className="flex-1 rounded-2xl h-14 font-bold border-gray-200 hover:bg-gray-50 transition-all"
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleDelete}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl h-14 font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sí, borrar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
