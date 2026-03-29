"use client";

import { LayoutDashboard, Users, Calendar, Settings, LogOut, BarChart2, Package, ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
        router.push("/");
        router.refresh();
    };

    return (
        <div className="flex min-h-screen bg-brand-dark font-sans text-slate-300 overflow-x-hidden w-full max-w-[100vw] tech-gradient-bg">

            {/* ── SIDEBAR ── */}
            <aside className={cn(
                "hidden md:flex flex-col fixed h-full z-40 transition-all duration-500 ease-in-out glass border-r border-white/10",
                isCollapsed ? "w-24" : "w-72"
            )}>
                {/* Toggle Button (Desktop) */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                    className="absolute -right-4 top-12 bg-brand-primary text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-50 hidden md:flex items-center justify-center group"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Logo Area */}
                <div className={cn("p-10 flex justify-center items-center transition-all duration-500", isCollapsed && "px-4")}>
                    <div className={cn(
                        "relative bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 transition-all duration-500 group overflow-hidden",
                        isCollapsed ? "w-14 h-14" : "w-full h-20"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="https://www.somosdostudio.com/logo-somosdos.png" alt="Somos Dos Studio" className={cn("object-contain w-full h-full p-4 transition-all drop-shadow-[0_0_10px_rgba(116,39,165,0.4)]", isCollapsed ? "p-4" : "p-5")} />
                    </div>
                </div>

                {/* Navigation Navigation */}
                <nav className="flex-1 px-6 space-y-3 mt-4 overflow-x-hidden">
                    <NavItem href="/admin"            icon={<LayoutDashboard className="w-6 h-6" />} active={isActive("/admin")}           label="Panel de Control"   collapsed={isCollapsed} />
                    <NavItem href="/admin/clientes"  icon={<Users           className="w-6 h-6" />} active={isActive("/admin/clientes")} label="Clientes"           collapsed={isCollapsed} />
                    <NavItem href="/admin/citas"       icon={<Calendar        className="w-6 h-6" />} active={isActive("/admin/citas")}      label="Agenda"             collapsed={isCollapsed} />
                    <NavItem href="/admin/inventario" icon={<Package         className="w-6 h-6" />} active={isActive("/admin/inventario")} label="Inventario"         collapsed={isCollapsed} />
                    <NavItem href="/admin/reportes"   icon={<BarChart2       className="w-6 h-6" />} active={isActive("/admin/reportes")}   label="Reportes"           collapsed={isCollapsed} />
                    <NavItem href="/admin/config"     icon={<Settings        className="w-6 h-6" />} active={isActive("/admin/config")}     label="Ajustes"            collapsed={isCollapsed} />
                </nav>

                {/* Footer: User & Logout */}
                <div className="p-8 space-y-6">
                    <div className={cn("flex items-center gap-4 transition-all", isCollapsed ? "justify-center" : "px-2")}>
                         <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-600 flex items-center justify-center text-white font-black shadow-lg">SD</div>
                         {!isCollapsed && (
                             <div className="flex flex-col min-w-0">
                                 <span className="text-sm font-black text-white truncate">Somos Dos Admin</span>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Studio</span>
                             </div>
                         )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center justify-center bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 rounded-2xl text-slate-400 hover:text-rose-400 transition-all mx-auto",
                            isCollapsed ? "w-12 h-12" : "w-full h-12 gap-3"
                        )}
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen w-full max-w-full transition-all duration-500 ease-in-out",
                isCollapsed ? "md:ml-24" : "md:ml-72"
            )}>
                {/* Page Content */}
                <main className="flex-1 px-4 md:px-16 pt-10 pb-28 md:pb-16 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 glass border border-white/10 px-6 py-4 z-50 rounded-[2.5rem] shadow-2xl pb-safe">
                <div className="flex justify-between items-center relative">
                    <MobileNavItem href="/admin"            icon={<LayoutDashboard className="w-6 h-6" />} active={isActive("/admin")} />
                    <MobileNavItem href="/admin/clientes"  icon={<Users           className="w-6 h-6" />} active={isActive("/admin/clientes")} />
                    
                    {/* Floating Center Action */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12">
                        <Link href="/admin/clientes" className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary text-white shadow-2xl shadow-brand-primary/40 border-4 border-brand-dark transition-transform active:scale-95">
                            <Plus className="w-8 h-8" />
                        </Link>
                    </div>

                    <MobileNavItem href="/admin/reportes"  icon={<BarChart2       className="w-6 h-6" />} active={isActive("/admin/reportes")} />
                    <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400"><LogOut className="w-6 h-6" /></button>
                </div>
            </nav>

            <Toaster theme="dark" position="top-center" richColors />
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
        <Link href={href} className={cn(
            "group flex items-center gap-5 px-4 py-4 rounded-2xl transition-all duration-300 relative font-heading",
            active
                ? "bg-white/5 text-white shadow-[0_0_20px_rgba(116,39,165,0.1)] border border-white/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
        )}>
            {/* Active Indicator Bar */}
            {active && (
                <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full" 
                />
            )}
            
            <div className={cn(
                "transition-all duration-300",
                active ? "text-brand-primary scale-110 drop-shadow-[0_0_8px_rgba(116,39,165,0.6)]" : "group-hover:text-brand-primary"
            )}>
                {icon}
            </div>
            
            {!collapsed && (
                <span className="font-bold text-sm tracking-wide whitespace-nowrap">{label}</span>
            )}
            
            {/* Tooltip when collapsed */}
            {collapsed && (
                <div className="absolute left-full ml-6 px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-2xl">
                    {label}
                </div>
            )}
        </Link>
    );
}

function MobileNavItem({ href, icon, active = false }: {
    href:    string;
    icon:    React.ReactNode;
    active?: boolean;
}) {
    return (
        <Link href={href} className={cn(
            "p-2 transition-all duration-300",
            active ? "text-brand-primary scale-110 drop-shadow-[0_0_8px_rgba(116,39,165,0.6)]" : "text-slate-500"
        )}>
            {icon}
        </Link>
    );
}
