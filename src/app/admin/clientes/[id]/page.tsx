"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, ClipboardList, ImageIcon, Activity, Loader2, AlertTriangle, Plus, FileText, Code, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  { id: "resumen", label: "Resumen", icon: User },
  { id: "descubrimiento", label: "Descubrimiento", icon: Code },
  { id: "historial", label: "Sprint Logs", icon: ClipboardList },
  { id: "fotos", label: "Media", icon: ImageIcon },
  { id: "planes", label: "Project Roadmap", icon: Activity },
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
        <p className="text-brand-primary font-black animate-pulse uppercase tracking-[0.2em] text-xs">Abriendo Roadmap...</p>
      </div>
    );
  }

  // ── Not found ──
  if (!cliente) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="w-16 h-16 text-amber-300" />
        <h2 className="text-2xl font-black text-gray-800">Cliente no encontrado</h2>
        <Link href="/admin/clientes">
          <Button variant="outline" className="rounded-2xl border-brand-primary text-brand-primary">Volver a la lista</Button>
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
    <div className="pb-24 max-w-[1600px] mx-auto px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── 1. HEADER & TOP ACTIONS ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 border-b border-brand-primary/20 pb-10">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <Link href="/admin/clientes">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-2xl hover:bg-brand-primary/10 text-brand-primary transition-all border border-gray-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-brand-primary/5 border-2 border-white shadow-md flex items-center justify-center text-brand-primary font-black text-2xl">
              {cliente.first_name?.[0]}{cliente.last_name?.[0]}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                {cliente.first_name} {cliente.last_name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/20">
                  ID · {cliente.id_number}
                </span>
                <span className="text-xs text-brand-secondary font-bold">● Activo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 lg:flex-none h-12 px-6 rounded-2xl border-gray-200 text-gray-600 hover:bg-brand-primary/5 font-bold transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar Info
          </Button>
          <Button
            onClick={() => setShowNuevaVisita(true)}
            className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 border-none shadow-lg shadow-emerald-100"
          >
            <Plus className="w-5 h-5 mr-3" />
            Registrar Log
          </Button>
        </div>
      </div>

      {/* ── 2. PREMIUM TAB NAVIGATION ── */}
      <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[1.8rem] border border-gray-100 shadow-xl mb-10 sticky top-6 z-30 flex flex-wrap lg:flex-nowrap gap-1">
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
                "flex-1 flex items-center justify-center gap-3 py-3.5 px-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all",
                isActive
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                  : "text-gray-600 hover:text-brand-primary hover:bg-white/80"
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
      </div>

      {/* ── MODALS & FAB ── */}
      <div className="fixed bottom-24 right-6 md:hidden z-40">
        <Button
          onClick={() => setShowNuevaVisita(true)}
          className="w-16 h-16 rounded-[1.8rem] bg-emerald-500 hover:bg-emerald-600 text-white transition-all active:scale-90 p-0 shadow-2xl shadow-emerald-200"
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
