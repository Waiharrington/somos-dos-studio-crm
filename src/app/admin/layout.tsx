"use client";

import { LayoutDashboard, Users, Calendar, Settings, LogOut, BarChart2, Package, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

/* eslint-disable @next/next/no-img-element */

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router   = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isActive = (path: string) => {
        if (path === "/admin") return pathname === "/admin";
        return pathname?.startsWith(path);
    };

    const handleLogout = async () => {
        const supabase = createSupabaseBrowser();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <div className="flex min-h-screen bg-[#FDF4F7] font-sans text-gray-600 overflow-x-hidden w-full max-w-[100vw]">

            {/* ── SIDEBAR ── */}
            <aside className={cn(
                "bg-gradient-to-b from-[#D685A9] to-[#E5BCd4] hidden md:flex flex-col fixed h-full z-40 rounded-r-[3rem] shadow-2xl shadow-pink-200/50 transition-all duration-500 ease-in-out",
                isCollapsed ? "w-24" : "w-72"
            )}>
                {/* Toggle Button (Desktop) */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                    className="absolute -right-4 top-12 bg-white text-[#D685A9] p-1.5 rounded-full shadow-lg border border-brand-primary/100 font-bold hover:scale-110 active:scale-95 transition-all z-50 hidden md:flex items-center justify-center group"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Logo */}
                <div className={cn("p-8 flex justify-center items-center transition-all duration-500", isCollapsed && "px-4")}>
                    <div className={cn(
                        "relative bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner border border-white/30 transition-all duration-500",
                        isCollapsed ? "w-12 h-12" : "w-32 h-16"
                    )}>
                        <img src="/logo-Somos Dos Studio.png" alt="Somos Dos Studio" className={cn("object-contain w-full h-full p-2 drop-shadow-sm transition-all", isCollapsed ? "p-3" : "p-2")} />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-x-hidden">
                    <NavItem href="/admin"            icon={<LayoutDashboard className="w-6 h-6" />} active={isActive("/admin")}           label="Dashboard"   collapsed={isCollapsed} />
                    <NavItem href="/admin/clientes"  icon={<Users           className="w-6 h-6" />} active={isActive("/admin/clientes")} label="clientes"   collapsed={isCollapsed} />
                    <NavItem href="/admin/citas"       icon={<Calendar        className="w-6 h-6" />} active={isActive("/admin/citas")}      label="Agenda"      collapsed={isCollapsed} />
                    <NavItem href="/admin/inventario" icon={<Package         className="w-6 h-6" />} active={isActive("/admin/inventario")} label="Inventario"  collapsed={isCollapsed} />
                    <NavItem href="/admin/reportes"   icon={<BarChart2       className="w-6 h-6" />} active={isActive("/admin/reportes")}   label="Reportes"    collapsed={isCollapsed} />
                    <NavItem href="/admin/config"     icon={<Settings        className="w-6 h-6" />} active={isActive("/admin/config")}     label="Config"      collapsed={isCollapsed} />
                </nav>

                {/* Logout */}
                <div className="p-8">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all mx-auto hover:scale-105",
                            isCollapsed ? "w-10 h-10" : "w-12 h-12"
                        )}
                        title="Cerrar sesión"
                    >
                        <LogOut className={cn("transition-all", isCollapsed ? "w-4 h-4" : "w-5 h-5")} />
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen w-full max-w-full transition-all duration-500 ease-in-out",
                isCollapsed ? "md:ml-24" : "md:ml-72"
            )}>

                {/* Page Content */}
                <main className="flex-1 px-4 md:px-12 pt-8 pb-24 md:pb-12 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-primary/100 px-4 py-2 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
                <div className="flex justify-between items-center relative">
                    {/* Left Group */}
                    <div className="flex gap-4 items-center">
                        <MobileNavItem href="/admin"            icon={<LayoutDashboard className="w-5 h-5" />} active={isActive("/admin")}           label="Inicio"    />
                        <MobileNavItem href="/admin/clientes"  icon={<Users           className="w-5 h-5" />} active={isActive("/admin/clientes")} label="clientes" />
                        <MobileNavItem href="/admin/inventario" icon={<Package         className="w-5 h-5" />} active={isActive("/admin/inventario")} label="Stock"     />
                    </div>

                    {/* Center Action */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10">
                        <Link href="/admin/citas" title="Nueva Cita" className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#D685A9] to-[#E5BCd4] text-white shadow-xl shadow-pink-200 border-4 border-white">
                            <Plus className="w-7 h-7" />
                        </Link>
                    </div>

                    {/* Right Group */}
                    <div className="flex gap-4 items-center">
                        <MobileNavItem href="/admin/citas"     icon={<Calendar        className="w-5 h-5" />} active={isActive("/admin/citas")}      label="Agenda"    />
                        <MobileNavItem href="/admin/reportes"  icon={<BarChart2       className="w-5 h-5" />} active={isActive("/admin/reportes")}  label="Reportes"  />
                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-[10px] font-medium">Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            <Toaster />
        </div>
    );
}

function NavItem({ href, icon, active = false, label, collapsed }: {
    href:    string;
    icon:    React.ReactNode;
    active?: boolean;
    label:   string;
    collapsed?: boolean;
}) {
    return (
        <Link href={href} className={`
            group flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 relative
            ${active
                ? "bg-white/20 text-white shadow-inner shadow-black/5 backdrop-blur-md"
                : "text-white/60 hover:bg-white/10 hover:text-white"}
        `}>
            <div className={`p-2 rounded-xl transition-all shrink-0 ${active ? "bg-white text-[#D685A9] shadow-sm" : "bg-transparent group-hover:scale-110"}`}>
                {icon}
            </div>
            {!collapsed && (
                <span className="font-medium tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>
            )}
            
            {/* Tooltip when collapsed */}
            {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-xl">
                    {label}
                </div>
            )}
        </Link>
    );
}

function MobileNavItem({ href, icon, active = false, label }: {
    href:    string;
    icon:    React.ReactNode;
    active?: boolean;
    label:   string;
}) {
    return (
        <Link href={href} className={`
            flex flex-col items-center gap-1 p-2 transition-colors
            ${active ? "text-[#D685A9]" : "text-gray-400 hover:text-gray-600"}
        `}>
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
