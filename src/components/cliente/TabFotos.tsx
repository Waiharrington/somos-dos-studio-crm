"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, ImageIcon, SplitSquareHorizontal, Trash2, Check } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadPhotoAction, deletePhotoAction, type PhotoType } from "@/app/actions/photos";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Photo = {
  id: string;
  storage_path: string;
  photo_type: PhotoType;
  body_zone: string | null;
  session_number: number | null;
  taken_at: string;
  notes: string | null;
  url: string | null;
};

type Props = {
  patientId: string;
  photos: Photo[];
  onRefresh: () => void;
};

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  before: "Boceto / Draft",
  after: "Versión Final",
  progress: "Desarrollo",
  reference: "Referencia",
};

const PHOTO_TYPE_STYLES: Record<PhotoType, string> = {
  before: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  after: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  reference: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
};

const PROJECT_COMPONENTS = [
  "Diseño UI/UX", "Mockups", "Landing Page", "Panel Admin",
  "Frontend", "Backend / API", "Esquema DB", "Documentación",
  "Asset / Logo", "App Móvil", "Social Media",
];

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export function TabFotos({ patientId, photos, onRefresh }: Props) {
  const [filterType, setFilterType] = useState<PhotoType | "all">("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<Photo | null>(null);
  const [compareB, setCompareB] = useState<Photo | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPhotos = photos.filter((p) => {
    if (filterType !== "all" && p.photo_type !== filterType) return false;
    if (filterZone !== "all" && p.body_zone !== filterZone) return false;
    return true;
  });

  const availableZones = [...new Set(photos.map((p) => p.body_zone).filter(Boolean))] as string[];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleQuickCompare = () => {
    if (selectedIds.length === 2) {
      const [idA, idB] = selectedIds;
      const photoA = photos.find(p => p.id === idA);
      const photoB = photos.find(p => p.id === idB);
      if (photoA && photoB) {
        setCompareA(photoA);
        setCompareB(photoB);
        setCompareMode(true);
        setSelectionMode(false);
        setSelectedIds([]);
      }
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm("¿Eliminar este archivo? Esta acción es irreversible.")) return;
    setDeletingId(photo.id);
    const result = await deletePhotoAction(photo.id, patientId, photo.storage_path);
    setDeletingId(null);
    if (result.success) {
      toast.success("Archivo eliminado.");
      onRefresh();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Eliminar ${selectedIds.length} archivos seleccionados?`)) return;
    let errors = 0;
    for (const id of selectedIds) {
      const p = photos.find(x => x.id === id);
      if (p) {
        const res = await deletePhotoAction(p.id, patientId, p.storage_path);
        if (!res.success) errors++;
      }
    }
    setSelectedIds([]);
    setSelectionMode(false);
    onRefresh();
    if (errors === 0) toast.success("Archivos eliminados.");
    else toast.error(`Error eliminando ${errors} archivos.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="flex items-center gap-3">
          {!compareMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds([]);
              }}
              className={cn(
                "rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest px-6 h-12 transition-all",
                selectionMode && "bg-brand-primary/20 text-brand-primary border-brand-primary/30"
              )}
            >
              {selectionMode ? "Cancelar" : "Seleccionar"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest px-6 h-12 transition-all",
              compareMode && "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
            )}
          >
            <SplitSquareHorizontal className="w-4 h-4 mr-2" />
            {compareMode ? "Cerrar Comparador" : "Comparación Visual"}
          </Button>
        </div>
        {!selectionMode && (
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl px-8 h-12 shadow-xl shadow-brand-primary/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-none"
          >
            <Camera className="w-4 h-4 mr-2" />
            Subir Multimedia
          </Button>
        )}
      </div>

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectionMode && selectedIds.length > 0 && (
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="sticky top-6 z-40 flex items-center justify-between bg-brand-primary/10 backdrop-blur-xl p-4 rounded-3xl border border-brand-primary/30 shadow-2xl"
            >
                <p className="text-xs font-black text-white ml-2 uppercase tracking-widest">
                    {selectedIds.length} elemento{selectedIds.length !== 1 ? "s" : ""} seleccionado{selectedIds.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                    {selectedIds.length === 2 && (
                    <Button size="sm" onClick={handleQuickCompare} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase px-6">
                        Comparar
                    </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={handleDeleteSelected} className="rounded-2xl text-[10px] font-black uppercase px-6 bg-rose-600 hover:bg-rose-700 border-none text-white shadow-lg shadow-rose-600/20">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                    </Button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      {!selectionMode && !compareMode && photos.length > 0 && (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <FilterChip active={filterType === "all"} onClick={() => setFilterType("all")}>
                    Todos ({photos.length})
                </FilterChip>
                {(["before", "after", "progress", "reference"] as PhotoType[]).map((type) => {
                    const count = photos.filter((p) => p.photo_type === type).length;
                    if (count === 0) return null;
                    return (
                    <FilterChip key={type} active={filterType === type} onClick={() => setFilterType(type)}>
                        {PHOTO_TYPE_LABELS[type]} ({count})
                    </FilterChip>
                    );
                })}
            </div>

            {availableZones.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <FilterChip active={filterZone === "all"} onClick={() => setFilterZone("all")} small>
                        Todos los componentes
                    </FilterChip>
                    {availableZones.map((zone) => (
                        <FilterChip key={zone} active={filterZone === zone} onClick={() => setFilterZone(zone)} small>
                        {zone}
                        </FilterChip>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* Modo comparación */}
      {compareMode && (
        <CompareMode
          photos={filteredPhotos}
          compareA={compareA}
          compareB={compareB}
          onSelectA={setCompareA}
          onSelectB={setCompareB}
        />
      )}

      {/* Galería */}
      {!compareMode && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {filteredPhotos.length === 0 ? (
            <EmptyPhotos hasAny={photos.length > 0} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isDeleting={deletingId === photo.id}
                  onDelete={() => handleDelete(photo)}
                  isSelectionMode={selectionMode}
                  isSelected={selectedIds.includes(photo.id)}
                  onToggleSelect={() => toggleSelect(photo.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de subida */}
      <AnimatePresence>
        {showUpload && (
            <UploadModal
            patientId={patientId}
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
                setShowUpload(false);
                onRefresh();
            }}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// FOTO CARD
// ─────────────────────────────────────────────

function PhotoCard({ photo, isDeleting, onDelete, isSelectionMode, isSelected, onToggleSelect }: {
  photo: Photo;
  isDeleting: boolean;
  onDelete: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const label = PHOTO_TYPE_LABELS[photo.photo_type];
  const style = PHOTO_TYPE_STYLES[photo.photo_type];
  const date = format(new Date(photo.taken_at + "T12:00:00"), "d MMM yy", { locale: es });

  return (
    <div
      onClick={isSelectionMode ? onToggleSelect : undefined}
      className={cn(
        "relative rounded-[2rem] overflow-hidden bg-white/5 aspect-square group border-2 transition-all cursor-pointer",
        isSelected ? "border-brand-primary scale-[0.98] shadow-2xl shadow-brand-primary/20" : "border-white/5 hover:border-white/10"
      )}
    >
      {photo.url ? (
        <img
          src={photo.url}
          alt={`${label} - ${photo.body_zone ?? ""}`}
          className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-110", isSelected && "opacity-60")}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-slate-800" />
        </div>
      )}

      {/* Checkbox de selección */}
      {isSelectionMode && (
        <div className={cn(
          "absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10",
          isSelected ? "bg-brand-primary border-brand-primary scale-110" : "bg-black/40 border-white/40"
        )}>
          {isSelected && <Check className="w-5 h-5 text-white" />}
        </div>
      )}

      {/* Overlay con info (solo si no estamos seleccionando) */}
      {!isSelectionMode && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4">
            <span className={cn("text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest", style)}>
              {label}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-2.5 bg-rose-600/90 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-xl"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <p className="text-white text-sm font-black tracking-tight">{photo.body_zone ?? "Sin componente"}</p>
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{date}</p>
                {photo.session_number && (
                <p className="text-brand-primary text-[10px] font-black uppercase tracking-widest">Sprint #{photo.session_number}</p>
                )}
            </div>
          </div>
        </>
      )}

      {/* Indicador de selección si está activo estilo simple */}
      {isSelectionMode && isSelected && (
        <div className="absolute inset-0 bg-brand-primary/10 pointer-events-none" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODO COMPARACIÓN
// ─────────────────────────────────────────────

function CompareMode({ photos, compareA, compareB, onSelectA, onSelectB }: {
  photos: Photo[];
  compareA: Photo | null;
  compareB: Photo | null;
  onSelectA: (p: Photo | null) => void;
  onSelectB: (p: Photo | null) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Selector de fotos */}
      <div className="grid grid-cols-2 gap-4">
        <PhotoSelector
          label="Proyecto A (Referencia)"
          selected={compareA}
          photos={photos}
          onSelect={onSelectA}
          accentColor="rose"
        />
        <PhotoSelector
          label="Proyecto B (Ajuste)"
          selected={compareB}
          photos={photos}
          onSelect={onSelectB}
          accentColor="emerald"
        />
      </div>

      {/* Slider comparación */}
      {compareA?.url && compareB?.url ? (
        <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={compareA.url}
                alt="Foto A"
                style={{ objectFit: "cover" }}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={compareB.url}
                alt="Foto B"
                style={{ objectFit: "cover" }}
              />
            }
            style={{ height: "460px" }}
          />
          <div className="absolute bottom-6 inset-x-6 flex justify-between pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
               <span className="text-rose-400 font-black text-[10px] uppercase tracking-widest">
                {PHOTO_TYPE_LABELS[compareA.photo_type]} · {compareA.body_zone ?? "General"}
              </span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                {PHOTO_TYPE_LABELS[compareB.photo_type]} · {compareB.body_zone ?? "General"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-24 text-center border-2 border-dashed border-white/5 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700">
            <SplitSquareHorizontal className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <p className="text-white font-black uppercase tracking-widest text-sm">Laboratorio de Comparación</p>
            <p className="text-slate-500 text-xs font-medium">Selecciona dos capas de desarrollo para analizar visualmente los cambios.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoSelector({ label, selected, photos, onSelect, accentColor }: {
  label: string;
  selected: Photo | null;
  photos: Photo[];
  onSelect: (p: Photo | null) => void;
  accentColor: "rose" | "emerald";
}) {
  const [open, setOpen] = useState(false);
  const colors = {
    rose: { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10" },
    emerald: { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  }[accentColor];

  return (
    <div className="relative">
      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2", colors.text)}>
        {label}
      </p>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full rounded-[2rem] border-2 overflow-hidden transition-all bg-white/5 aspect-square relative group",
          selected ? colors.border : "border-white/5 hover:border-white/10"
        )}
      >
        {selected?.url ? (
          <div className="h-full w-full">
            <img src={selected.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className={cn("absolute bottom-4 left-4 right-4 p-3 rounded-xl backdrop-blur-md border border-white/10", colors.bg)}>
              <span className={cn("text-[9px] font-black uppercase tracking-widest block", colors.text)}>
                {PHOTO_TYPE_LABELS[selected.photo_type]} · {selected.body_zone ?? "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-600">
                <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seleccionar</p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-card p-3 border-white/10 shadow-3xl overflow-hidden max-h-64 overflow-y-auto z-50 animate-in slide-in-from-top-2">
          {photos.filter((p) => p.url).map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/10 transition-all text-left group"
            >
              <img src={p.url!} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate group-hover:text-brand-primary transition-colors">
                  {PHOTO_TYPE_LABELS[p.photo_type]}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {p.body_zone ?? "Sin zona"} · {format(new Date(p.taken_at + "T12:00:00"), "d MMM", { locale: es })}
                </p>
              </div>
            </button>
          ))}
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className="w-full p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors text-center border-t border-white/5 mt-2"
          >
            Deseleccionar
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL DE SUBIDA
// ─────────────────────────────────────────────

function UploadModal({ patientId, onClose, onSuccess }: {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    photo_type: "before" as PhotoType,
    body_zone: "",
    notes: "",
  });

  const handleFile = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes.");
      return;
    }
    const compressed = await imageCompression(f, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
    setFile(compressed);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(compressed);
  };

  const handleUpload = async () => {
    if (!file || !preview) {
      toast.error("Selecciona una archivo primero.");
      return;
    }
    setIsUploading(true);
    const result = await uploadPhotoAction({
      patient_id: patientId,
      photo_type: form.photo_type,
      body_zone: form.body_zone || undefined,
      notes: form.notes || undefined,
      taken_at: new Date().toISOString().split("T")[0],
      file_base64: preview,
      file_name: file.name,
      file_size_kb: Math.round(file.size / 1024),
    });
    setIsUploading(false);
    if (result.success) {
      toast.success("Archivo subido correctamente.");
      onSuccess();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose} 
        />
        <motion.div 
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            className="relative glass-card w-full max-w-xl max-h-[90vh] flex flex-col border-white/10 overflow-hidden shadow-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0">
            <div>
                <h2 className="text-2xl font-black text-white font-heading tracking-tight">Agregar Multimedia</h2>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">Carga de assets del proyecto</p>
            </div>
            <button onClick={onClose} title="Cerrar" className="p-3 rounded-full hover:bg-white/5 text-slate-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">

            {/* Zona de previsualización */}
            {preview ? (
              <div className="relative rounded-[2rem] overflow-hidden aspect-video bg-white/5 border border-white/10 group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreview(null); setFile(null); }}
                  title="Eliminar"
                  className="absolute top-4 right-4 bg-rose-600 p-2.5 rounded-xl text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-[10px] font-black text-white border border-white/10">
                  {file ? `${Math.round(file.size / 1024)} KB` : ""}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center gap-4 py-12 rounded-[2rem] border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-all text-brand-primary"
                >
                  <div className="p-4 bg-brand-primary/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Tomar Foto</p>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center gap-4 py-12 rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all text-slate-500"
                >
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Subir Archivo</p>
                </button>
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" title="Cámara" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <input ref={fileInputRef} type="file" accept="image/*" title="Galería" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {/* Tipo de foto */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Fase de Desarrollo</label>
              <div className="grid grid-cols-2 gap-3">
                {(["before", "after", "progress", "reference"] as PhotoType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((p) => ({ ...p, photo_type: type }))}
                    className={cn(
                      "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      form.photo_type === type
                        ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20"
                        : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"
                    )}
                  >
                    {PHOTO_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Zona corporal */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Componente Vinculado</label>
              <select
                value={form.body_zone}
                title="Seleccionar componente"
                onChange={(e) => setForm((p) => ({ ...p, body_zone: e.target.value }))}
                className="w-full h-16 px-6 text-sm font-bold rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-brand-primary/50 transition-all appearance-none"
              >
                <option value="" className="bg-brand-dark">Seleccionar componente</option>
                {PROJECT_COMPONENTS.map((z) => (
                  <option key={z} value={z} className="bg-brand-dark text-white">{z}</option>
                ))}
              </select>
            </div>

            {/* Notas */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Observaciones Técnicas</label>
              <textarea
                placeholder="Ej: Ajustes de tipografía y contraste en la versión móvil..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-6 py-4 text-sm font-bold rounded-2xl border border-white/10 bg-white/5 text-white resize-none focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-slate-700"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-16 border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white">
              Cerrar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!preview || isUploading}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-widest"
            >
              {isUploading ? (
                <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Subiendo...</>
              ) : (
                "Guardar Archivo"
              )}
            </Button>
          </div>

        </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function FilterChip({ active, onClick, children, small }: {
  active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 font-black uppercase tracking-widest border rounded-xl transition-all whitespace-nowrap",
        small ? "text-[8px] px-3 py-1.5" : "text-[10px] px-5 py-2.5",
        active
          ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20"
          : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function EmptyPhotos({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
        <ImageIcon className="w-10 h-10 text-slate-800" />
      </div>
      <div className="space-y-1">
        <p className="font-black text-white uppercase tracking-widest text-sm">
            {hasAny ? "Sin resultados" : "Galería Vacía"}
        </p>
        <p className="text-xs text-slate-500 max-w-xs font-medium leading-relaxed">
            {hasAny
            ? "No se han encontrado archivos que coincidan con los filtros seleccionados."
            : "Comienza a subir bocetos, capturas o entregables finales para llevar el control visual de este proyecto."}
        </p>
      </div>
    </div>
  );
}
