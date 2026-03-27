"use client";
// Build: 1774578888

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Building, Lock, User, Sparkles, Plus, Edit3, Trash2, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getServicesAction,
  createServiceAction,
  updateServiceAction,
  toggleServiceAction,
  deleteServiceAction,
  type ServiceCategory,
} from "@/app/actions/services";
import { cn } from "@/lib/utils";
import { getClinicSettingsAction, updateClinicSettingsAction, updateDoctorPortraitAction, type ClinicSettings } from "@/app/actions/settings";
import { useRef } from "react";

/* eslint-disable @next/next/no-img-element */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  all:         "Todas",
  laser:       "Láser",
  facial:      "Facial",
  body:        "Corporal",
  injectables: "Inyectables",
  other:       "Otros",
};

const CATEGORY_COLORS: Record<string, string> = {
  laser:       "bg-purple-100 text-purple-700",
  facial:      "bg-brand-primary/100 text-brand-primary/700",
  body:        "bg-blue-100 text-blue-700",
  injectables: "bg-amber-100 text-amber-700",
  other:       "bg-gray-100 text-gray-600",
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type ServiceItem = {
  id:                    string;
  name:                  string;
  category:              ServiceCategory;
  price:                 number | null;
  currency:              string;
  duration_minutes:      number;
  sessions_recommended:  number;
  description:           string | null;
  notes:                 string | null;
  is_active:             boolean;
};

// ─────────────────────────────────────────────
// MAIN CONFIG PAGE
// ─────────────────────────────────────────────

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. Header Section */}
      <div className="border-b border-brand-primary/50 pb-10">
        <div className="space-y-2">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-brand-primary/50 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/100/50">
                Ajustes del Sistema
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Configuración <span className="text-transparent bg-clip-text bg-brand-primary">Global</span>
            </h1>
            <p className="text-gray-500 font-medium max-w-2xl">
                Personaliza la experiencia de Somos Dos Studio, gestiona tus servicios y establece los parámetros operativos de tu estudio estética.
            </p>
        </div>
      </div>

      {/* 2. PREMIUM TAB NAVIGATION */}
      <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[1.8rem] border border-brand-primary/50 shadow-[0_10px_30px_-10px_rgba(255,182,193,0.3)] sticky top-6 z-30 flex flex-wrap lg:flex-nowrap gap-1">
        <TabButton id="perfil"         label="Mi Perfil"       icon={<User     className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="clinica"        label="Estudio"         icon={<Building className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="servicios"      label="Servicios"       icon={<Sparkles className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="notificaciones" label="Notificaciones"  icon={<Bell     className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="seguridad"      label="Seguridad"       icon={<Lock     className="w-4 h-4" />} active={activeTab} onClick={setActiveTab} />
      </div>

      {/* 3. Main Content Area */}
      <div className={cn(
        "bg-white rounded-[2.5rem] shadow-sm shadow-pink-100/50 border border-brand-primary/50 min-h-[500px] animate-in fade-in zoom-in-95 duration-500",
        activeTab === "servicios" ? "p-6 md:p-10" : "p-8 md:p-14"
      )}>
        {activeTab === "perfil"    && <PerfilTab />}
        {activeTab === "clinica"   && <ClinicaTab />}
        {activeTab === "servicios" && <ServiciosTab />}
      </div>
    </div>
  );
}

function PerfilTab() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getClinicSettingsAction();
      if (res.success) {
        setSettings(res.data!);
      } else {
        toast.error("Error al cargar configuración: " + res.error);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSync = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await updateClinicSettingsAction(settings);
    if (res.success) {
      toast.success("Perfil actualizado correctamente");
    } else {
      toast.error("Error al actualizar: " + res.error);
    }
    setSaving(false);
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const originalBase64 = event.target?.result as string;
        // Comprimir antes de enviar
        const compressedBase64 = await compressImage(originalBase64);
        
        const res = await updateDoctorPortraitAction(compressedBase64, file.name);
        if (res.success) {
          setSettings(prev => prev ? { ...prev, doctor_portrait_url: res.url! } : null);
          toast.success("Retrato actualizado");
        } else {
          toast.error("Error al subir imagen: " + res.error);
        }
      } catch (err: any) {
        toast.error("Error inesperado: " + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-primary/300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl shadow-pink-100/80 perspective-card group-hover:rotate-1 transition-transform duration-500 bg-brand-primary/50 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-brand-primary/300 animate-spin" />
            ) : settings?.doctor_portrait_url ? (
              <img 
                src={settings.doctor_portrait_url} 
                alt="Somos Dos Studio" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" 
              />
            ) : (
                <img 
                src="/img/dra-Somos Dos Studio.png" 
                alt="Somos Dos Studio" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" 
              />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Editar foto de perfil" 
            className="absolute -bottom-3 -right-3 bg-brand-primary text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-white focus:outline-none"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <input 
            id="portrait-upload"
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            style={{ display: 'none' }}
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Configuración</h1>
      </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {settings?.doctor_name.includes(" ") ? settings.doctor_name.split(" ")[0] : "Dra."} <span className="text-transparent bg-clip-text bg-brand-primary">{settings?.doctor_name.includes(" ") ? settings.doctor_name.split(" ").slice(1).join(" ") : settings?.doctor_name}</span>
          </h2>
          <p className="text-[11px] font-black text-brand-primary/300 uppercase tracking-[0.3em]">{settings?.doctor_specialty}</p>
          <div className="pt-2">
             <Button 
                type="button"
                variant="ghost" 
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-primary font-bold hover:bg-brand-primary/50 px-4 rounded-xl transition-all"
             >
                {uploading ? "Subiendo..." : "Cambiar Retrato"}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <Field label="Nombre Médico">
          <Input 
            value={settings?.doctor_name} 
            onChange={(e) => setSettings(p => p ? { ...p, doctor_name: e.target.value } : null)}
            className="h-14 rounded-2xl border-brand-primary/50 bg-brand-primary/50/20 px-5 focus-visible:ring-pink-200 font-bold text-gray-800" 
          />
        </Field>
        <Field label="Especialidad">
          <Input 
            value={settings?.doctor_specialty} 
            onChange={(e) => setSettings(p => p ? { ...p, doctor_specialty: e.target.value } : null)}
            className="h-14 rounded-2xl border-brand-primary/50 bg-brand-primary/50/20 px-5 focus-visible:ring-pink-200 font-bold text-gray-800" 
          />
        </Field>
        {/* Usamos estos campos para la Estudio si es necesario, o los dejamos hardcoded por ahora */}
        <Field label="Correo Corporativo">
          <Input defaultValue="dra.Somos Dos Studio@clinica.com" className="h-14 rounded-2xl border-brand-primary/50 bg-brand-primary/50/20 px-5 focus-visible:ring-pink-200 font-bold text-gray-800 disabled:opacity-50" disabled />
        </Field>
        <Field label="Teléfono de Contacto">
          <Input defaultValue="+58 412 000 0000" className="h-14 rounded-2xl border-brand-primary/50 bg-brand-primary/50/20 px-5 focus-visible:ring-pink-200 font-bold text-gray-800 disabled:opacity-50" disabled />
        </Field>
      </div>

      <div className="pt-10 mt-10 border-t border-brand-primary/50 flex flex-col sm:flex-row justify-end gap-4">
        <Button variant="ghost" className="text-gray-400 font-bold px-8 rounded-2xl">Cancelar</Button>
        <Button 
          onClick={handleSync}
          disabled={saving}
          className="bg-brand-primary hover:shadow-xl hover:shadow-pink-300/40 text-white h-14 px-12 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 border-none shadow-lg shadow-pink-100"
        >
           {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sincronizar Cambios"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-brand-primary/300 uppercase tracking-widest pl-1">{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: CLÍNICA
// ─────────────────────────────────────────────

function ClinicaTab() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl text-sm border border-yellow-100 flex items-center gap-3">
        <Building className="w-5 h-5 flex-shrink-0" />
        <p>Esta información aparecerá en los correos y facturas enviados a tus clientes.</p>
      </div>
      <div className="space-y-2">
        <Label>Nombre de la Estudio</Label>
        <Input defaultValue="Somos Dos Studio Estudio Avanzada" className="bg-gray-50 border-gray-200" />
      </div>
      <div className="space-y-2">
        <Label>Dirección</Label>
        <Input defaultValue="Av. Libertador 1234, Piso 5, Oficina B" className="bg-gray-50 border-gray-200" />
      </div>

      <div className="pt-8 mt-4 border-t border-gray-100 flex justify-end gap-4">
        <Button variant="ghost" className="text-gray-400 hover:text-gray-600">Cancelar</Button>
        <Button className="bg-[#D685A9] hover:bg-[#B34D7F] text-white px-8 rounded-full shadow-lg shadow-pink-100">
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: SERVICIOS
// ─────────────────────────────────────────────

function ServiciosTab() {
  const [services, setServices]   = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<ServiceItem | null>(null);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await getServicesAction(true);
    if (res.success) setServices(res.data as ServiceItem[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id: string, current: boolean) => {
    const res = await toggleServiceAction(id, !current);
    if (res.success) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
      toast.success(!current ? "Servicio activado" : "Servicio desactivado");
    } else {
      toast.error("Error al cambiar estado");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const res = await deleteServiceAction(id);
    if (res.success) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Servicio eliminado");
    } else {
      toast.error((res as { error?: string }).error ?? "Error al eliminar");
    }
  };

  const cats = ["all", "laser", "facial", "body", "injectables", "other"];

  const filtered = services.filter(s => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat  = catFilter === "all" || s.category === catFilter;
    return matchName && matchCat;
  });

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <Input
          placeholder="Buscar servicio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-brand-primary/50/30 border-brand-primary/100 sm:max-w-xs h-9 text-sm"
        />
        <Button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-[#D685A9] hover:bg-[#B34D7F] text-white rounded-full px-5 shadow-md shadow-pink-200 whitespace-nowrap h-9 text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Nuevo Servicio
        </Button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {cats.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-bold transition-all",
              catFilter === cat
                ? "bg-[#D685A9] text-white shadow-sm"
                : "bg-brand-primary/50 text-gray-500 hover:bg-brand-primary/100"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Table / Loading / Empty */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-primary/400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay servicios{catFilter !== "all" ? " en esta categoría" : ""}</p>
          <p className="text-xs mt-1">Crea tu primer servicio con el botón de arriba</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-primary/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-primary/50/60 text-left text-xs">
                  <th className="px-4 py-3 text-gray-500 font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">Precio</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Duración</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Sesiones</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold text-center">Estado</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50/70">
                {filtered.map(s => (
                  <tr key={s.id} className={cn("hover:bg-brand-primary/50/20 transition-colors", !s.is_active && "opacity-50")}>
                    <td className="px-4 py-3 font-semibold text-gray-800 max-w-[180px] truncate">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide", CATEGORY_COLORS[s.category])}>
                        {CATEGORY_LABELS[s.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                      {s.price != null
                        ? `${s.currency} ${Number(s.price).toLocaleString("es-VE")}`
                        : <span className="text-gray-400 italic text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{s.duration_minutes} min</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{s.sessions_recommended}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(s.id, s.is_active)}
                        title={s.is_active ? "Desactivar" : "Activar"}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none",
                          s.is_active ? "bg-green-400" : "bg-gray-300"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                          s.is_active ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(s); setShowModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-brand-primary/50 text-gray-400 hover:text-[#D685A9] transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ServiceModal
          service={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: CREAR / EDITAR SERVICIO
// ─────────────────────────────────────────────

function ServiceModal({ service, onClose, onSaved }: {
  service:  ServiceItem | null;
  onClose:  () => void;
  onSaved:  () => void;
}) {
  const isEditing = !!service;
  const [form, setForm] = useState({
    name:                 service?.name                          ?? "",
    category:             (service?.category ?? "other")         as ServiceCategory,
    price:                service?.price?.toString()             ?? "",
    currency:             service?.currency                      ?? "USD",
    duration_minutes:     service?.duration_minutes?.toString()  ?? "60",
    sessions_recommended: service?.sessions_recommended?.toString() ?? "1",
    description:          service?.description                   ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("El nombre es requerido"); return; }

    setIsSaving(true);
    const payload = {
      name:                  form.name.trim(),
      category:              form.category,
      price:                 form.price ? parseFloat(form.price) : null,
      currency:              form.currency,
      duration_minutes:      parseInt(form.duration_minutes) || 60,
      sessions_recommended:  parseInt(form.sessions_recommended) || 1,
      description:           form.description.trim() || undefined,
    };

    const res = isEditing
      ? await updateServiceAction(service!.id, payload)
      : await createServiceAction(payload);

    setIsSaving(false);

    if (res.success) {
      toast.success(isEditing ? "Servicio actualizado" : "Servicio creado");
      onSaved();
    } else {
      toast.error((res as { error?: string }).error ?? "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-primary/50 sticky top-0 bg-white rounded-t-3xl">
          <h2 className="font-bold text-gray-800 text-lg">
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <button onClick={onClose} title="Cerrar" className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Nombre *</Label>
            <Input
              id="svc-name"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Ej: Láser Alexandrita Full Piernas"
              className="bg-brand-primary/50/30 border-brand-primary/100"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label htmlFor="svc-cat">Categoría</Label>
            <select
              id="svc-cat"
              title="Categoría"
              value={form.category}
              onChange={e => set("category", e.target.value)}
              className="w-full h-10 rounded-lg border border-brand-primary/100 bg-brand-primary/50/30 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
              <option value="laser">Láser</option>
              <option value="facial">Facial</option>
              <option value="body">Corporal</option>
              <option value="injectables">Inyectables</option>
              <option value="other">Otros</option>
            </select>
          </div>

          {/* Precio + Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="svc-price">Precio</Label>
              <Input
                id="svc-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0.00"
                className="bg-brand-primary/50/30 border-brand-primary/100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-currency">Moneda</Label>
              <select
                id="svc-currency"
                title="Moneda"
                value={form.currency}
                onChange={e => set("currency", e.target.value)}
                className="w-full h-10 rounded-lg border border-brand-primary/100 bg-brand-primary/50/30 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                <option value="USD">USD</option>
                <option value="VES">VES</option>
              </select>
            </div>
          </div>

          {/* Duración + Sesiones */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-dur">Duración (minutos)</Label>
              <Input
                id="svc-dur"
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={e => set("duration_minutes", e.target.value)}
                className="bg-brand-primary/50/30 border-brand-primary/100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-sessions">Sesiones recomendadas</Label>
              <Input
                id="svc-sessions"
                type="number"
                min="1"
                value={form.sessions_recommended}
                onChange={e => set("sessions_recommended", e.target.value)}
                className="bg-brand-primary/50/30 border-brand-primary/100"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Descripción (opcional)</Label>
            <textarea
              id="svc-desc"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              placeholder="Breve descripción del servicio..."
              className="w-full rounded-lg border border-brand-primary/100 bg-brand-primary/50/30 px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-pink-200"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#D685A9] hover:bg-[#B34D7F] text-white rounded-full px-8 shadow-md shadow-pink-200"
            >
              {isSaving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : (isEditing ? "Guardar Cambios" : "Crear Servicio")
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB BUTTON
// ─────────────────────────────────────────────

function TabButton({ id, label, icon, active, onClick }: {
  id:      string;
  label:   string;
  icon:    React.ReactNode;
  active:  string;
  onClick: (id: string) => void;
}) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex-1 flex items-center justify-center gap-3 py-3.5 px-6 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all",
        isActive
          ? "bg-brand-primary text-white shadow-lg shadow-pink-200"
          : "text-gray-400 hover:text-brand-primary hover:bg-white/80"
      )}
    >
      <div className={cn("transition-colors", isActive ? "text-white" : "text-brand-primary/300")}>{icon}</div>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
