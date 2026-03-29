"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, AlertTriangle, TrendingDown, Search, Loader2, X, Trash2, Edit3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getInventoryAction,
  createInventoryItemAction,
  updateInventoryItemAction,
  adjustStockAction,
  deleteInventoryItemAction,
  type CreateItemInput,
  type ItemCategory,
  type MovementType,
} from "@/app/actions/inventory";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type InventoryItem = {
  id:            string;
  name:          string;
  brand:         string | null;
  category:      ItemCategory;
  stock_qty:     number;
  unit:          string;
  sale_price:    number | null;
  cost_price:    number | null;
  currency:      string;
  reorder_level: number;
  stock_status:  "ok" | "stock_bajo" | "sin_stock";
  stock_value:   number;
};

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  product:    "Venta Directa",
  consumable: "Insumo / Recurso",
  equipment:  "Hardware / Equipo",
};

const CATEGORY_STYLES: Record<ItemCategory, string> = {
  product:    "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  consumable: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  equipment:  "bg-white/5 text-slate-400 border-white/10",
};

const STOCK_STATUS_CONFIG = {
  ok:         { label: "Stock Óptimo", bg: "bg-emerald-500/10",  text: "text-emerald-400",  dot: "bg-emerald-500" },
  stock_bajo: { label: "Stock Bajo",   bg: "bg-amber-500/10",    text: "text-amber-400",    dot: "bg-amber-500" },
  sin_stock:  { label: "Agotado",     bg: "bg-rose-500/10",     text: "text-rose-400",     dot: "bg-rose-500" },
};

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────

export default function InventarioPage() {
  const [items, setItems]         = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "stock_bajo" | "sin_stock">("all");
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await getInventoryAction();
    if (res.success) setItems(res.data as InventoryItem[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true : item.stock_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    setDeletingId(id);
    const res = await deleteInventoryItemAction(id);
    if (res.success) {
      toast.success("Producto eliminado.");
      load();
    } else {
      toast.error(`Error: ${res.error}`);
    }
    setDeletingId(null);
  };

  const lowStockCount = items.filter((i) => i.stock_status !== "ok").length;
  const totalValue    = items.reduce((acc, i) => acc + (i.stock_value ?? 0), 0);

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8">

      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/20">
                Logística Somos Dos
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-heading">
                Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500 text-shadow-glow">Recursos</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-2xl">
                Control centralizado de insumos, herramientas y activos digitales de Somos Dos Studio.
            </p>
        </div>

        <Button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="h-14 px-8 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all border-none active:scale-95 w-full xl:w-auto"
        >
          <Plus className="w-5 h-5 mr-3" />
          Agregar Recurso
        </Button>
      </div>

      {/* 2. Stats Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            icon={<Package className="w-5 h-5" />}   
            label="Catálogo Total"   
            value={items.length.toString()}  
            color="purple" 
        />
        <StatCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Alertas de Stock" 
            value={lowStockCount.toString()} 
            color="rose" 
            trend={lowStockCount > 0 ? "Acción Requerida" : "Todo Óptimo"}
        />
        <StatCard 
            icon={<TrendingDown className="w-5 h-5" />} 
            label="Valorización de Activos"
            value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            color="blue" 
        />
      </div>

      {/* 3. Filters & Inventory View */}
      <div className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <Input
                placeholder="Buscar por nombre, proveedor o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-14 h-14 rounded-2xl border-white/5 bg-white/5 backdrop-blur-xl focus:border-brand-primary/50 text-white font-bold placeholder:text-slate-700 shadow-xl"
              />
            </div>
            <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner w-full lg:w-auto">
              {[
                { value: "all",       label: "Todo" },
                { value: "stock_bajo", label: "Stock Bajo" },
                { value: "sin_stock", label: "Agotados" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value as "all" | "stock_bajo" | "sin_stock")}
                  className={cn(
                    "flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filterStatus === f.value
                      ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10"
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Almacén...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-6 border-2 border-dashed border-white/5 rounded-[2.5rem] m-8">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
                    <Package className="w-12 h-12 text-slate-800" />
                </div>
                <div className="space-y-2">
                    <p className="font-black text-2xl text-white font-heading">
                        {search ? "Sin resultados" : "Inventario Vacío"}
                    </p>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                        {search ? "No se han encontrado recursos que coincidan con los criterios de búsqueda." : "Aún no se han registrado recursos o insumos en el sistema."}
                    </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-left">Recurso / Marca</th>
                      <th className="hidden lg:table-cell px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-left">Categoría</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-left">Disponibilidad</th>
                      <th className="hidden sm:table-cell px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-left">Valoración</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((item) => {
                      const ss = STOCK_STATUS_CONFIG[item.stock_status];
                      const sym = item.currency === "USD" ? "$" : item.currency === "VES" ? "Bs." : "$";
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                                <p className="font-black text-white text-lg tracking-tight font-heading group-hover:text-brand-primary transition-colors">{item.name}</p>
                                {item.brand && <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.brand}</p>}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-10 py-8 text-left">
                            <span className={cn("text-[8px] font-black px-4 py-1.5 rounded-lg border uppercase tracking-widest shadow-xl", CATEGORY_STYLES[item.category])}>
                              {CATEGORY_LABELS[item.category]}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-black px-4 py-2 rounded-xl border flex items-center gap-3 shadow-xl",
                                ss.bg, ss.text, "border-white/5"
                              )}>
                                <span className={cn("w-2 h-2 rounded-full shadow-lg", ss.dot)} />
                                {item.stock_qty} {item.unit}
                              </span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-10 py-8">
                             <div className="space-y-1">
                                <span className="text-base font-black text-white tracking-tighter">
                                    {item.sale_price ? `${sym}${item.sale_price.toLocaleString()}` : "—"}
                                </span>
                                {item.cost_price && (
                                    <span className="block text-[9px] font-black text-slate-600 uppercase tracking-widest">Costo: {sym}{item.cost_price}</span>
                                )}
                             </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAdjustItem(item)}
                                className="h-10 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-brand-primary/30 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-brand-primary/5"
                              >
                                <Settings2 className="w-3.5 h-3.5 mr-2" />
                                Ajustar
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => { setEditItem(item); setShowForm(true); }}
                                title="Editar"
                                className="h-10 w-10 rounded-2xl text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all border border-transparent hover:border-brand-primary/20"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item.id)}
                                title="Eliminar"
                                className="h-10 w-10 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                              >
                                {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>

      {/* Modal: Crear / Editar */}
      <AnimatePresence>
        {showForm && (
            <ItemFormModal
            item={editItem}
            onClose={() => { setShowForm(false); setEditItem(null); }}
            onSuccess={() => { setShowForm(false); setEditItem(null); load(); }}
            />
        )}
      </AnimatePresence>

      {/* Modal: Ajustar stock */}
      <AnimatePresence>
        {adjustItem && (
            <AdjustStockModal
            item={adjustItem}
            onClose={() => setAdjustItem(null)}
            onSuccess={() => { setAdjustItem(null); load(); }}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: CREAR / EDITAR ITEM
// ─────────────────────────────────────────────

function ItemFormModal({ item, onClose, onSuccess }: {
  item: InventoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:          item?.name ?? "",
    brand:         item?.brand ?? "",
    category:      (item?.category ?? "product") as ItemCategory,
    stock_qty:     item?.stock_qty ?? 0,
    unit:          item?.unit ?? "unidad",
    sale_price:    item?.sale_price?.toString() ?? "",
    cost_price:    item?.cost_price?.toString() ?? "",
    currency:      item?.currency ?? "USD",
    reorder_level: item?.reorder_level ?? 3,
  });

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    const input: CreateItemInput = {
      name:          form.name,
      brand:         form.brand || undefined,
      category:      form.category,
      stock_qty:     Number(form.stock_qty),
      unit:          form.unit,
      sale_price:    form.sale_price ? Number(form.sale_price) : null,
      cost_price:    form.cost_price ? Number(form.cost_price) : null,
      currency:      form.currency,
      reorder_level: Number(form.reorder_level),
    };

    const res = item
      ? await updateInventoryItemAction(item.id, input)
      : await createInventoryItemAction(input);

    setSaving(false);
    if (res.success) {
      toast.success(item ? "Recurso actualizado." : "Recurso registrado.");
      onSuccess();
    } else {
      toast.error(`Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.95 }}
            className="relative glass-card w-full max-w-xl max-h-[90vh] flex flex-col border-white/10 overflow-hidden shadow-3xl">
          
          <div className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01]">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-heading">{item ? "Editar Recurso" : "Registrar Recurso"}</h2>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">Configuración de inventario</p>
            </div>
            <button onClick={onClose} title="Cerrar" className="p-3 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            <Field label="Nombre del Recurso *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Licencia de Software, Insumo de Oficina..." 
              className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Proveedor / Marca">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Ej: Google Cloud, Apple..." 
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white focus:border-brand-primary/50" />
              </Field>
              <Field label="Categoría">
                <select value={form.category} title="Categoría" onChange={(e) => set("category", e.target.value as ItemCategory)}
                  className="w-full h-14 px-6 text-sm font-bold rounded-2xl border border-white/5 bg-brand-dark text-white focus:outline-none focus:border-brand-primary/50 appearance-none transition-all">
                  <option value="product" className="bg-brand-dark">Venta Directa</option>
                  <option value="consumable" className="bg-brand-dark">Insumo / Recurso</option>
                  <option value="equipment" className="bg-brand-dark">Hardware / Equipo</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Stock Inic.">
                <Input type="number" value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)} 
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white text-center" />
              </Field>
              <Field label="Unidad">
                <select value={form.unit} title="Unidad" onChange={(e) => set("unit", e.target.value)}
                  className="w-full h-14 px-4 text-sm font-bold rounded-2xl border border-white/5 bg-brand-dark text-white focus:outline-none text-center appearance-none">
                  {["unidad","ml","g","caja","frasco","par","rollo"].map((u) => <option key={u} value={u} className="bg-brand-dark">{u}</option>)}
                </select>
              </Field>
              <Field label="Alerta Min.">
                <Input type="number" value={form.reorder_level} onChange={(e) => set("reorder_level", e.target.value)} 
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white text-center" />
              </Field>
            </div>

            <div className="bg-white/[0.02] rounded-[2rem] p-8 space-y-6 border border-white/5">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-2">Estructura de Costos</p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Moneda">
                  <select value={form.currency} title="Moneda" onChange={(e) => set("currency", e.target.value)}
                    className="w-full h-14 px-4 text-sm font-bold rounded-2xl border border-white/5 bg-brand-dark text-white appearance-none text-center">
                    <option value="USD">USD</option><option value="VES">VES</option><option value="COP">COP</option>
                  </select>
                </Field>
                <Field label="Costo">
                  <Input type="number" placeholder="0.00" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} 
                  className="rounded-2xl border-white/5 bg-brand-dark h-14 text-sm font-bold text-white text-center" />
                </Field>
                <Field label="Venta">
                  <Input type="number" placeholder="0.00" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} 
                  className="rounded-2xl border-white/5 bg-brand-dark h-14 text-sm font-bold text-white text-center" />
                </Field>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-16 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all" disabled={saving}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-widest border-none">
              {saving ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" />Guardando...</> : (item ? "Actualizar" : "Registrar")}
            </Button>
          </div>
        </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: AJUSTAR STOCK
// ─────────────────────────────────────────────

function AdjustStockModal({ item, onClose, onSuccess }: {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving]   = useState(false);
  const [qty, setQty]         = useState("");
  const [type, setType]       = useState<MovementType>("restock");
  const [notes, setNotes]     = useState("");

  const handleSubmit = async () => {
    const quantity = parseFloat(qty);
    if (isNaN(quantity) || quantity === 0) { toast.error("Ingresa una cantidad válida."); return; }
    setSaving(true);
    const finalQty = ["sale","use","loss"].includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
    const res = await adjustStockAction({ item_id: item.id, quantity: finalQty, movement_type: type, notes: notes || undefined });
    setSaving(false);
    if (res.success) {
      toast.success("Stock ajustado correctamente.");
      onSuccess();
    } else {
      toast.error(`Error: ${res.error}`);
    }
  };

  const MOVEMENT_TYPES: { value: MovementType; label: string; isOut: boolean }[] = [
    { value: "restock",    label: "Reposición de Stock", isOut: false },
    { value: "sale",       label: "Salida por Venta",    isOut: true  },
    { value: "use",        label: "Consumo Interno",         isOut: true  },
    { value: "adjustment", label: "Ajuste Técnico",       isOut: false },
    { value: "loss",       label: "Pérdida / Descarte",   isOut: true  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <motion.div initial={{ y: 100, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.95 }}
            className="relative glass-card w-full max-w-md max-h-[85vh] flex flex-col border-white/10 overflow-hidden shadow-3xl">
          
          <div className="p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.01]">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight font-heading">Ajustar Inventario</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.name} · Actual: {item.stock_qty} {item.unit}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            <Field label="Razón del Movimiento">
              <div className="grid grid-cols-1 gap-2">
                {MOVEMENT_TYPES.map((m) => (
                  <button key={m.value} onClick={() => setType(m.value)}
                    className={cn("flex items-center justify-between px-6 py-4 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                      type === m.value ? "bg-brand-primary/20 text-brand-primary border-brand-primary" : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-white")}>
                    <span>{m.label}</span>
                    <span className={cn("text-[9px] font-black", type === m.value ? "text-white/40" : m.isOut ? "text-rose-500" : "text-emerald-500")}>
                      {m.isOut ? "− salida" : "+ entrada"}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Cantidad a Ajustar (${item.unit})`}>
              <Input type="number" min={0.01} step={0.01} placeholder="Ej: 5" value={qty} onChange={(e) => setQty(e.target.value)}
                className="rounded-2xl border-white/5 bg-white/5 h-16 text-xl font-black text-white text-center focus:border-brand-primary/50" />
            </Field>

            <Field label="Comentarios Téc. (opcional)">
              <Input placeholder="Ej: Nueva adquisición para el estudio..." value={notes} onChange={(e) => setNotes(e.target.value)}
                className="rounded-2xl border-white/5 bg-white/5 h-14 text-sm font-bold text-white placeholder:text-slate-700 focus:border-brand-primary/50" />
            </Field>
          </div>

          <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-16 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95" disabled={saving}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl h-16 shadow-xl shadow-brand-primary/20 transition-all font-black uppercase text-[10px] tracking-widest border-none active:scale-95">
              {saving ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Procesando...</> : "Confirmar Ajuste"}
            </Button>
          </div>
        </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend?: string }) {
  const backgrounds: Record<string, string> = {
    purple: "from-brand-primary/20 to-brand-primary/5 border-brand-primary/20 text-brand-primary",
    rose:   "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
    blue:   "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  };
  return (
    <div className={cn("glass-card p-8 bg-gradient-to-br transition-all hover:scale-[1.02] relative group overflow-hidden", backgrounds[color] ?? backgrounds.purple)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:opacity-[0.08] transition-opacity" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 shadow-xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
        {trend && (
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">
                {trend}
            </div>
        )}
      </div>
      <p className="text-3xl font-black text-white tracking-tighter font-heading mb-1">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">{label}</label>
      {children}
    </div>
  );
}
