"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Package, AlertTriangle, TrendingDown, Search, Loader2, X, Trash2 } from "lucide-react";
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
  product:    "Producto",
  consumable: "Insumo",
  equipment:  "Equipo",
};

const CATEGORY_STYLES: Record<ItemCategory, string> = {
  product:    "bg-brand-primary/50 text-brand-primary/700 border-brand-primary/100",
  consumable: "bg-blue-50 text-blue-700 border-blue-100",
  equipment:  "bg-gray-50 text-gray-700 border-gray-200",
};

const STOCK_STATUS_CONFIG = {
  ok:         { label: "En stock",    bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  stock_bajo: { label: "Stock bajo",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500" },
  sin_stock:  { label: "Sin stock",   bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
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
    if (!confirm("¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.")) return;
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
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-brand-primary/50 pb-10">
        <div className="space-y-2">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-brand-primary/50 text-brand-primary text-[10px] font-black tracking-widest uppercase border border-brand-primary/100/50">
                Logística Clínic
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Control de <span className="text-transparent bg-clip-text bg-brand-primary">Inventario</span>
            </h1>
            <p className="text-gray-600 font-semibold">
                Gestión avanzada de productos, insumos y equipamiento médico.
            </p>
        </div>

        <Button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="bg-brand-primary hover:shadow-xl hover:shadow-pink-300/40 text-white h-12 px-8 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 border-none shadow-lg shadow-pink-100 w-full md:w-auto"
        >
          <Plus className="w-5 h-5 mr-3" />
          Agregar Producto
        </Button>
      </div>

      {/* 2. Stats Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            icon={<Package className="w-5 h-5" />}   
            label="Catálogo Total"   
            value={items.length.toString()}  
            color="pink" 
        />
        <StatCard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Productos en Alerta" 
            value={lowStockCount.toString()} 
            color="red" 
            trend="Revisión requerida"
        />
        <StatCard 
            icon={<TrendingDown className="w-5 h-5" />} 
            label="Valor del Stock"
            value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            color="purple" 
        />
      </div>

      {/* 3. Filters & Inventory View */}
      <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/300" />
              <Input
                placeholder="Buscar por nombre, marca o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-brand-primary/50 bg-white/60 backdrop-blur-md focus-visible:ring-pink-200 placeholder:text-gray-500 font-bold"
              />
            </div>
            <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-[1.5rem] border border-brand-primary/50 shadow-sm w-full lg:w-auto overflow-x-auto gap-1">
              {[
                { value: "all",       label: "Todo" },
                { value: "stock_bajo", label: "Stock Bajo" },
                { value: "sin_stock", label: "Agotados" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value as "all" | "stock_bajo" | "sin_stock")}
                  className={cn(
                    "flex-1 lg:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    filterStatus === f.value
                      ? "bg-brand-primary text-white shadow-lg shadow-pink-200"
                      : "text-gray-400 hover:text-brand-primary hover:bg-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-brand-primary/50 shadow-sm overflow-hidden perspective-card">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                <p className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] animate-pulse">Sincronizando Almacén...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-6">
                <div className="w-20 h-20 bg-brand-primary/50 rounded-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-brand-primary/200" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-xl text-gray-800">
                        {search ? "Sin coincidencias" : "Almacén Vacío"}
                    </p>
                    <p className="text-gray-600 font-semibold max-w-xs mx-auto">
                        {search ? "No encontramos nada que coincida con tu búsqueda." : "Aún no has registrado productos en el inventario."}
                    </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-brand-primary/50/30 text-left">
                      <th className="px-8 py-5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Producto / Marca</th>
                      <th className="hidden lg:table-cell px-8 py-5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Categoría</th>
                      <th className="px-8 py-5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Disponibilidad</th>
                      <th className="hidden sm:table-cell px-8 py-5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">P. Venta</th>
                      <th className="px-8 py-5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50/50">
                    {filtered.map((item) => {
                      const ss = STOCK_STATUS_CONFIG[item.stock_status];
                      const sym = item.currency === "USD" ? "$" : item.currency === "VES" ? "Bs." : "$";
                      return (
                        <tr key={item.id} className="hover:bg-brand-primary/50/20 transition-all duration-300 group">
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                                <p className="font-black text-gray-900 group-hover:text-brand-primary transition-colors">{item.name}</p>
                                {item.brand && <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.brand}</p>}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-8 py-6">
                            <span className={cn("text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest shadow-sm", CATEGORY_STYLES[item.category])}>
                              {CATEGORY_LABELS[item.category]}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-black px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm",
                                ss.bg, ss.text
                              )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", ss.dot)} />
                                {item.stock_qty} {item.unit}
                              </span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-8 py-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-800">
                                    {item.sale_price ? `${sym} ${item.sale_price.toLocaleString()}` : "—"}
                                </span>
                                {item.cost_price && (
                                    <span className="text-[9px] font-bold text-gray-600">Costo: {sym}{item.cost_price}</span>
                                )}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAdjustItem(item)}
                                className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-brand-primary/100 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                              >
                                Ajustar
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => { setEditItem(item); setShowForm(true); }}
                                title="Editar"
                                className="h-9 w-9 rounded-xl text-gray-400 hover:text-brand-primary hover:bg-brand-primary/50 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item.id)}
                                title="Eliminar"
                                className="h-9 w-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
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
      {showForm && (
        <ItemFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSuccess={() => { setShowForm(false); setEditItem(null); load(); }}
        />
      )}

      {/* Modal: Ajustar stock */}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSuccess={() => { setAdjustItem(null); load(); }}
        />
      )}
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
      toast.success(item ? "Producto actualizado." : "Producto agregado.");
      onSuccess();
    } else {
      toast.error(`Error: ${res.error}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[520px] w-full max-h-[90vh] flex flex-col shadow-2xl">
          <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-primary/50 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">{item ? "Editar producto" : "Nuevo producto"}</h2>
            <button onClick={onClose} title="Cerrar" className="p-2 rounded-full hover:bg-brand-primary/50 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Nombre *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Serum Vitamina C" className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marca">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Ej: The Ordinary" className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
              </Field>
              <Field label="Categoría">
                <select value={form.category} title="Categoría" onChange={(e) => set("category", e.target.value as ItemCategory)}
                  className="w-full h-10 px-3 text-sm rounded-2xl border border-brand-primary/100 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option value="product">Producto (venta)</option>
                  <option value="consumable">Insumo (uso clínico)</option>
                  <option value="equipment">Equipo</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Stock inicial">
                <Input type="number" value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)} className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
              </Field>
              <Field label="Unidad">
                <select value={form.unit} title="Unidad" onChange={(e) => set("unit", e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-2xl border border-brand-primary/100 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
                  {["unidad","ml","g","caja","frasco","par","rollo"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Alerta en">
                <Input type="number" value={form.reorder_level} onChange={(e) => set("reorder_level", e.target.value)} className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
              </Field>
            </div>
            <div className="bg-brand-primary/50/50 rounded-2xl p-4 space-y-3 border border-brand-primary/100">
              <p className="text-[10px] font-black text-brand-primary/300 uppercase tracking-widest">Precios</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Moneda">
                  <select value={form.currency} title="Moneda" onChange={(e) => set("currency", e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-2xl border border-brand-primary/100 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
                    <option value="USD">USD</option><option value="VES">VES</option><option value="COP">COP</option>
                  </select>
                </Field>
                <Field label="Precio costo">
                  <Input type="number" placeholder="0.00" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
                </Field>
                <Field label="Precio venta">
                  <Input type="number" placeholder="0.00" value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
                </Field>
              </div>
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-brand-primary/50 flex-shrink-0">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-full border-brand-primary/100" disabled={saving}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-[#D685A9] hover:bg-[#B34D7F] text-white rounded-full shadow-lg shadow-pink-100 transition-all active:scale-95">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </>
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
      toast.success("Stock actualizado.");
      onSuccess();
    } else {
      toast.error(`Error: ${res.error}`);
    }
  };

  const MOVEMENT_TYPES: { value: MovementType; label: string; isOut: boolean }[] = [
    { value: "restock",    label: "Reposición / Compra", isOut: false },
    { value: "sale",       label: "Venta a cliente",    isOut: true  },
    { value: "use",        label: "Uso clínico",         isOut: true  },
    { value: "adjustment", label: "Ajuste manual",       isOut: false },
    { value: "loss",       label: "Pérdida / Vencido",   isOut: true  },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:w-[420px] w-full max-h-[80vh] flex flex-col shadow-2xl">
          <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-primary/50 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Ajustar stock</h2>
              <p className="text-xs text-gray-400 mt-0.5">{item.name} · Actual: {item.stock_qty} {item.unit}</p>
            </div>
            <button onClick={onClose} title="Cerrar" className="p-2 rounded-full hover:bg-brand-primary/50 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <Field label="Tipo de movimiento">
              <div className="space-y-2">
                {MOVEMENT_TYPES.map((m) => (
                  <button key={m.value} onClick={() => setType(m.value)}
                    className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all",
                      type === m.value ? "bg-[#D685A9] text-white border-[#D685A9]" : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary/200")}>
                    <span>{m.label}</span>
                    <span className={cn("text-xs font-black", type === m.value ? "text-white/80" : m.isOut ? "text-red-400" : "text-green-500")}>
                      {m.isOut ? "− salida" : "+ entrada"}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Cantidad (${item.unit})`}>
              <Input type="number" min={0.01} step={0.01} placeholder="Ej: 5" value={qty} onChange={(e) => setQty(e.target.value)}
                className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300 text-lg font-bold" />
            </Field>
            <Field label="Notas (opcional)">
              <Input placeholder="Ej: Compra a proveedor X" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="rounded-2xl border-brand-primary/100 focus-visible:ring-pink-300" />
            </Field>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-brand-primary/50 flex-shrink-0">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-full border-brand-primary/100" disabled={saving}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-[#D685A9] hover:bg-[#B34D7F] text-white rounded-full shadow-lg shadow-pink-100 transition-all active:scale-95">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : "Confirmar"}
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

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend?: string }) {
  const colors: Record<string, string> = {
    pink:   "from-pink-50 to-pink-100/50 text-[#9D4D76]",
    red:    "from-red-50 to-red-100/50 text-red-600",
    green:  "from-green-50 to-green-100/50 text-green-600",
    purple: "from-purple-50 to-purple-100/50 text-purple-700",
  };
  return (
    <div className={cn("rounded-2xl p-4 bg-gradient-to-br text-center relative overflow-hidden", colors[color] ?? colors.pink)}>
      <div className="flex justify-center mb-1.5 opacity-60">{icon}</div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{label}</p>
      {trend && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/20 text-[8px] font-black uppercase tracking-tighter">
              {trend}
          </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
