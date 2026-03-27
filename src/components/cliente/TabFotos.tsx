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
  after: "Entrega Final",
  progress: "En Progreso",
  reference: "Referencia",
};

const PHOTO_TYPE_STYLES: Record<PhotoType, string> = {
  before: "bg-amber-50 text-amber-600 border-amber-100",
  after: "bg-emerald-50 text-emerald-600 border-emerald-100",
  progress: "bg-blue-50 text-blue-600 border-blue-100",
  reference: "bg-brand-primary/5 text-brand-primary border-brand-primary/10",
};

const PROJECT_COMPONENTS = [
  "UI/UX Design", "Mockups", "Landing Page", "Admin Dashboard",
  "Frontend", "Backend / API", "Database Schema", "Documentation",
  "Asset / Logo", "Mobile App", "Social Media",
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
    if (!confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
    setDeletingId(photo.id);
    const result = await deletePhotoAction(photo.id, patientId, photo.storage_path);
    setDeletingId(null);
    if (result.success) {
      toast.success("Foto eliminada.");
      onRefresh();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Eliminar ${selectedIds.length} fotos seleccionadas?`)) return;
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
    if (errors === 0) toast.success("Fotos eliminadas.");
    else toast.error(`Error eliminando ${errors} fotos.`);
  };

  return (
    <div className="space-y-5">

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {!compareMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds([]);
              }}
              className={cn(
                "rounded-full border-brand-primary/100 text-sm gap-2",
                selectionMode && "bg-brand-primary/100 text-[#D685A9] border-[#D685A9]"
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
              "rounded-full border-brand-primary/100 text-sm gap-2",
              compareMode && "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
            )}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            {compareMode ? "Cerrar Comparador" : "Comparar"}
          </Button>
        </div>
        {!selectionMode && (
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full px-4 shadow-lg shadow-brand-primary/20 text-sm gap-2 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            Agregar foto
          </Button>
        )}
      </div>

      {/* Floating Selection Bar */}
      {selectionMode && selectedIds.length > 0 && (
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-brand-primary/100 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <p className="text-sm font-bold text-gray-700 ml-2">
            {selectedIds.length} seleccionada{selectedIds.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            {selectedIds.length === 2 && (
              <Button size="sm" onClick={handleQuickCompare} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs">
                Comparar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleDeleteSelected} className="rounded-full text-xs bg-rose-500 hover:bg-rose-600 border-none text-white">
              <Trash2 className="w-3 h-3 mr-1" />
              Borrar
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      {!selectionMode && !compareMode && photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip active={filterType === "all"} onClick={() => setFilterType("all")}>
            Todas ({photos.length})
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
      )}

      {/* Filtro por zona */}
      {availableZones.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip active={filterZone === "all"} onClick={() => setFilterZone("all")} small>
            Todas las zonas
          </FilterChip>
          {availableZones.map((zone) => (
            <FilterChip key={zone} active={filterZone === zone} onClick={() => setFilterZone(zone)} small>
              {zone}
            </FilterChip>
          ))}
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
        <>
          {filteredPhotos.length === 0 ? (
            <EmptyPhotos hasAny={photos.length > 0} />
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-20">
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
        </>
      )}

      {/* Modal de subida */}
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
        "relative rounded-[1.5rem] overflow-hidden bg-gray-100 aspect-square group border-2 transition-all cursor-pointer",
        isSelected ? "border-brand-primary scale-[0.98]" : "border-gray-100"
      )}
    >
      {photo.url ? (
        <img
          src={photo.url}
          alt={`${label} - ${photo.body_zone ?? ""}`}
          className={cn("w-full h-full object-cover transition-transform duration-500", isSelected && "opacity-80")}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Checkbox de selección */}
      {isSelectionMode && (
        <div className={cn(
          "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors z-10",
          isSelected ? "bg-brand-primary border-brand-primary" : "bg-white/50 border-white"
        )}>
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      )}

      {/* Overlay con info (solo si no estamos seleccionando) */}
      {!isSelectionMode && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-2 left-2">
            <span className={cn("text-[10px] font-black px-2 py-1 rounded-full border", style)}>
              {label}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs font-bold">{photo.body_zone ?? "Sin zona"}</p>
            <p className="text-white/80 text-[10px]">{date}</p>
            {photo.session_number && (
              <p className="text-white/70 text-[10px]">Sesión #{photo.session_number}</p>
            )}
          </div>
        </>
      )}

      {/* Indicador de selección si está activo estilo simple */}
      {isSelectionMode && isSelected && (
        <div className="absolute inset-0 bg-brand-primary/500/10 pointer-events-none" />
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
    <div className="space-y-4">
      {/* Selector de fotos */}
      <div className="grid grid-cols-2 gap-3">
        <PhotoSelector
          label="Foto A (Antes)"
          selected={compareA}
          photos={photos}
          onSelect={onSelectA}
          accentColor="rose"
        />
        <PhotoSelector
          label="Foto B (Después)"
          selected={compareB}
          photos={photos}
          onSelect={onSelectB}
          accentColor="emerald"
        />
      </div>

      {/* Slider comparación */}
      {compareA?.url && compareB?.url ? (
        <div className="rounded-[1.5rem] overflow-hidden border border-brand-primary/100 shadow-sm">
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
            style={{ height: "340px" }}
          />
          <div className="flex justify-between text-xs font-bold px-4 py-2 bg-white">
            <span className="text-rose-500">
              {PHOTO_TYPE_LABELS[compareA.photo_type]} · {compareA.body_zone ?? "—"} ·{" "}
              {format(new Date(compareA.taken_at + "T12:00:00"), "d MMM yy", { locale: es })}
            </span>
            <span className="text-emerald-500">
              {PHOTO_TYPE_LABELS[compareB.photo_type]} · {compareB.body_zone ?? "—"} ·{" "}
              {format(new Date(compareB.taken_at + "T12:00:00"), "d MMM yy", { locale: es })}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
          <SplitSquareHorizontal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-semibold">Selecciona dos fotos para comparar</p>
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
    rose: { border: "border-rose-200", text: "text-rose-600", bg: "bg-rose-50" },
    emerald: { border: "border-emerald-200", text: "text-emerald-600", bg: "bg-emerald-50" },
  }[accentColor];

  return (
    <div>
      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", colors.text)}>
        {label}
      </p>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full rounded-2xl border-2 overflow-hidden transition-all",
          selected ? colors.border : "border-gray-200"
        )}
      >
        {selected?.url ? (
          <div className="relative">
            <img src={selected.url} alt="" className="w-full aspect-square object-cover" />
            <div className={cn("absolute bottom-0 left-0 right-0 p-2 text-[10px] font-bold text-white", colors.bg)}>
              <span className={colors.text}>
                {PHOTO_TYPE_LABELS[selected.photo_type]} · {selected.body_zone ?? "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center gap-1 bg-gray-50">
            <ImageIcon className="w-6 h-6 text-gray-300" />
            <p className="text-[10px] text-gray-400">Seleccionar</p>
          </div>
        )}
      </button>

      {open && (
        <div className="mt-1 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden max-h-48 overflow-y-auto z-10">
          {photos.filter((p) => p.url).map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brand-primary/50 transition-colors text-left"
            >
              <img src={p.url!} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">
                  {PHOTO_TYPE_LABELS[p.photo_type]} · {p.body_zone ?? "Sin zona"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {format(new Date(p.taken_at + "T12:00:00"), "d MMM yy", { locale: es })}
                </p>
              </div>
            </button>
          ))}
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className="w-full px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 text-center"
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
    // Comprimir antes de previsualizar
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
      toast.error("Selecciona una foto primero.");
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
      toast.success("Foto subida correctamente.");
      onSuccess();
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[480px] w-full max-h-[90vh] flex flex-col shadow-2xl">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-primary/50 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Agregar foto</h2>
            <button onClick={onClose} title="Cerrar" className="p-2 rounded-full hover:bg-brand-primary/50 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Zona de previsualización / selección */}
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreview(null); setFile(null); }}
                  title="Quitar foto"
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-gray-600 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-white/80 rounded-xl px-2 py-1 text-xs font-bold text-gray-700">
                  {file ? `${Math.round(file.size / 1024)} KB` : ""}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Botón cámara (móvil) */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-brand-primary/200 bg-brand-primary/50/50 text-brand-primary/600 font-bold hover:bg-brand-primary/50 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Tomar foto con cámara
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Seleccionar de la galería
                </button>
              </div>
            )}

            {/* Inputs ocultos */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              title="Cámara"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              title="Galería"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* Tipo de foto */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary/300 uppercase tracking-widest">
                Tipo de foto
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["before", "after", "progress", "reference"] as PhotoType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm((p) => ({ ...p, photo_type: type }))}
                    className={cn(
                      "py-2.5 rounded-2xl text-sm font-bold border transition-all",
                      form.photo_type === type
                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                        : "bg-white text-gray-500 border-gray-200 hover:border-brand-primary/20"
                    )}
                  >
                    {PHOTO_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Zona corporal */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest">
                Componente de proyecto
              </label>
              <select
                value={form.body_zone}
                title="Seleccionar zona corporal"
                onChange={(e) => setForm((p) => ({ ...p, body_zone: e.target.value }))}
                className="w-full h-10 px-3 text-sm rounded-2xl border border-brand-primary/100 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700"
              >
                <option value="">Seleccionar componente</option>
                {PROJECT_COMPONENTS.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary/300 uppercase tracking-widest">
                Notas (opcional)
              </label>
              <textarea
                placeholder="Ej: Foto tomada bajo luz natural. Se aprecia reducción del 60%."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 text-sm rounded-2xl border border-brand-primary/100 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white placeholder:text-gray-300"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-brand-primary/50">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-full border-brand-primary/100">
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!preview || isUploading}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</>
              ) : (
                "Guardar foto"
              )}
            </Button>
          </div>

        </div>
      </div>
    </>
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
        "flex-shrink-0 font-bold border rounded-full transition-all whitespace-nowrap",
        small ? "text-[10px] px-2.5 py-1" : "text-xs px-3 py-1.5",
        active
          ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
          : "bg-white text-gray-500 border-gray-200 hover:border-brand-primary/20 hover:bg-brand-primary/5"
      )}
    >
      {children}
    </button>
  );
}

function EmptyPhotos({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-300" />
      </div>
      <p className="font-bold text-gray-500">
        {hasAny ? "Sin fotos con ese filtro" : "Sin fotos registradas"}
      </p>
      <p className="text-sm text-gray-400 max-w-xs">
        {hasAny
          ? "Prueba cambiando el filtro."
          : "Agrega assets o versiones para hacer seguimiento visual del proyecto."}
      </p>
    </div>
  );
}
