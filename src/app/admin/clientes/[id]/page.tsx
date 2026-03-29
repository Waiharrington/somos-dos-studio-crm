"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, ClipboardList, ImageIcon, Activity, Loader2, AlertTriangle, Plus, FileText, Code } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Actions
import { getClienteByIdAction } from "@/app/actions/clientes";
import { getVisitsByPatientAction } from "@/app/actions/visits";
import { getPlansByPatientAction } from "@/app/actions/plans";
import { getPhotosByPatientAction } from "@/app/actions/photos";

// Tabs y Modals
import { TabResumen } from "@/components/cliente/TabResumen";
import { TabHistorial } from "@/components/cliente/TabHistorial";
import { TabFotos } from "@/components/cliente/TabFotos";
import { TabPlanes } from "@/components/cliente/TabPlanes";
import { TabExpediente } from "@/components/cliente/TabExpediente";
import { ModalNuevoSprintLog } from "@/components/cliente/ModalNuevoSprintLog";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type TabId = "resumen" | "descubrimiento" | "historial" | "fotos" | "planes";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "resumen", label: "Perfil", icon: User },
  { id: "descubrimiento", label: "Análisis", icon: Code },
  { id: "historial", label: "Bitácora", icon: ClipboardList },
  { id: "fotos", label: "Galería", icon: ImageIcon },
  { id: "planes", label: "Hoja de Ruta", icon: Activity },
];

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [cliente, setCliente] = useState<any>(null); 
  const [visits, setVisits] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNuevaVisita, setShowNuevaVisita] = useState(false);

  // ── Fetch ──
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const [clienteRes, visitsRes, plansRes, photosRes] = await Promise.all([
      getClienteByIdAction(id),
      getVisitsByPatientAction(id),
      getPlansByPatientAction(id),
      getPhotosByPatientAction(id),
    ]);
    if (clienteRes.success) setCliente(clienteRes.data);
    if (visitsRes.success) setVisits(visitsRes.data ?? []);
    if (plansRes.success) setPlans(plansRes.data ?? []);
    if (photosRes.success) setPhotos(photosRes.data ?? []);
    setIsLoading(false);
  }, [id]);

  useEffect(() => { if (id) loadAll(); }, [id, loadAll]);

  // ── Refresh individuales (después de mutaciones) ──
  const refreshVisits = useCallback(async () => {
    const res = await getVisitsByPatientAction(id);
    if (res.success) setVisits(res.data ?? []);
  }, [id]);

  const refreshPlans = useCallback(async () => {
    const res = await getPlansByPatientAction(id);
    if (res.success) setPlans(res.data ?? []);
  }, [id]);

  const refreshPhotos = useCallback(async () => {
    const res = await getPhotosByPatientAction(id);
    if (res.success) setPhotos(res.data ?? []);
  }, [id]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        <p className="text-brand-primary font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Sincronizando Expediente...</p>
      </div>
    );
  }

  // ── Not found ──
  if (!cliente) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-black text-white">Registro no encontrado</h2>
        <Link href="/admin/clientes">
          <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:text-white">Volver a Clientes</Button>
        </Link>
      </div>
    );
  }

  // ── Datos derivados ──
  const activePlan = plans.find((p) => p.status === "active") ?? null;
  const lastVisit = visits.find((v) => v.status === "completed") ?? null;
  const completedSessions = visits.filter((v) => v.status === "completed").length;

  // ── Render ──
  return (
    <div className="pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">

      {/* ── 1. HEADER & TOP ACTIONS ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <Link href="/admin/clientes">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand-primary/20 to-blue-500/10 border border-white/10 flex items-center justify-center text-brand-primary font-black text-2xl shadow-xl shadow-brand-primary/5">
              {cliente.first_name?.[0]}{cliente.last_name?.[0]}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none font-heading">
                {cliente.first_name} {cliente.last_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/20">
                  EXP · {cliente.id_number}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVO
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Resumen PDF
          </Button>
          <Button
            onClick={() => setShowNuevaVisita(true)}
            className="flex-1 lg:flex-none bg-brand-primary hover:bg-brand-primary/90 text-white h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border-none shadow-xl shadow-brand-primary/20"
          >
            <Plus className="w-5 h-5 mr-3" />
            Registrar Avance
          </Button>
        </div>
      </div>

      {/* ── 2. PREMIUM TAB NAVIGATION ── */}
      <div className="glass-card p-2 rounded-[2rem] border-white/5 shadow-2xl mb-12 sticky top-6 z-30 flex flex-wrap lg:flex-nowrap gap-1">
        {TABS.map(({ id: tabId, label, icon: Icon }) => {
          const isActive = activeTab === tabId;
          const count =
            tabId === "historial" ? visits.length :
              tabId === "fotos" ? photos.length :
                tabId === "planes" ? plans.length :
                  null;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                isActive
                  ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-brand-primary/40")} />
              <span className="hidden sm:inline">{label}</span>
              {count !== null && count > 0 && (
                <span className={cn(
                  "py-0.5 px-2 rounded-lg font-black text-[9px] min-w-[20px] shadow-inner",
                  isActive ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. CONTENT AREA ── */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === "resumen" && (
                <TabResumen
                    patient={cliente}
                    activePlan={activePlan}
                    lastVisit={lastVisit}
                    totalSessions={completedSessions}
                />
                )}
                {activeTab === "descubrimiento" && (
                <TabExpediente patient={cliente} />
                )}
                {activeTab === "historial" && (
                <TabHistorial visits={visits} />
                )}
                {activeTab === "fotos" && (
                <TabFotos
                    patientId={id}
                    photos={photos}
                    onRefresh={refreshPhotos}
                />
                )}
                {activeTab === "planes" && (
                <TabPlanes
                    patientId={id}
                    plans={plans}
                    onRefresh={refreshPlans}
                />
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MODALS & FAB ── */}
      <div className="fixed bottom-24 right-6 md:hidden z-40">
        <Button
          onClick={() => setShowNuevaVisita(true)}
          className="w-16 h-16 rounded-[1.8rem] bg-brand-primary hover:bg-brand-primary/90 text-white transition-all active:scale-90 p-0 shadow-2xl shadow-brand-primary/20"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      <ModalNuevoSprintLog
        patientId={id}
        plans={plans}
        isOpen={showNuevaVisita}
        onClose={() => setShowNuevaVisita(false)}
        onSuccess={() => {
          refreshVisits();
          refreshPlans();
        }}
      />
    </div>
  );
}
