"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Calendar, AlertCircle, CheckCircle, RefreshCw, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPendingFollowUpsAction, type FollowUp } from "@/app/actions/reminders";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export function WidgetRecordatorios() {
  const [followUps, setFollowUps]   = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    const result = await getPendingFollowUpsAction(14);
    if (result.success) setFollowUps(result.data);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const overdue  = followUps.filter((f) => f.isOverdue);
  const upcoming = followUps.filter((f) => !f.isOverdue);

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-brand-primary/50 shadow-sm shadow-pink-100/50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-brand-primary/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-primary/50 rounded-xl">
            <Calendar className="w-4 h-4 text-brand-primary/400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm md:text-base">Recordatorios</h3>
            <p className="text-[10px] text-gray-400">clientes que necesitan contacto</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Body */}
      <div className="divide-y divide-pink-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-brand-primary/400 animate-spin" />
          </div>
        ) : followUps.length === 0 ? (
          <AllClearState />
        ) : (
          <>
            {/* Vencidas */}
            {overdue.length > 0 && (
              <Section
                label="Vencidas"
                icon={<AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                items={overdue}
                variant="overdue"
              />
            )}

            {/* Próximas */}
            {upcoming.length > 0 && (
              <Section
                label="Próximas — 14 días"
                icon={<Calendar className="w-3.5 h-3.5 text-blue-500" />}
                items={upcoming}
                variant="upcoming"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECCIÓN (vencidas / próximas)
// ─────────────────────────────────────────────

function Section({ label, icon, items, variant }: {
  label: string;
  icon: React.ReactNode;
  items: FollowUp[];
  variant: "overdue" | "upcoming";
}) {
  return (
    <div>
      <div className={cn(
        "flex items-center gap-2 px-5 md:px-6 py-2.5",
        variant === "overdue" ? "bg-red-50/50" : "bg-blue-50/30"
      )}>
        {icon}
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          variant === "overdue" ? "text-red-500" : "text-blue-500"
        )}>
          {label}
        </span>
        <span className={cn(
          "ml-auto text-[10px] font-black px-2 py-0.5 rounded-full",
          variant === "overdue" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}>
          {items.length}
        </span>
      </div>

      {items.map((f) => (
        <FollowUpRow key={f.visitId} followUp={f} variant={variant} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// FILA DE SEGUIMIENTO
// ─────────────────────────────────────────────

function FollowUpRow({ followUp: f, variant }: { followUp: FollowUp; variant: "overdue" | "upcoming" }) {
  const whatsappUrl = buildWhatsAppUrl(
    f.phone,
    f.patientName,
    f.treatmentApplied,
    f.nextVisitDate
  );

  const dateLabel = format(
    new Date(f.nextVisitDate + "T12:00:00"),
    "d MMM",
    { locale: es }
  );

  const dayLabel =
    f.daysUntilVisit === 0  ? "Hoy" :
    f.daysUntilVisit === 1  ? "Mañana" :
    f.daysUntilVisit === -1 ? "Ayer" :
    f.daysUntilVisit < 0    ? `Hace ${Math.abs(f.daysUntilVisit)} días` :
    `En ${f.daysUntilVisit} días`;

  const initials = f.patientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-5 md:px-6 py-3 hover:bg-gray-50/50 transition-colors">

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D685A9]/30 to-[#9D4D76]/30 flex items-center justify-center text-[#9D4D76] font-black text-xs flex-shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/admin/clientes/${f.patientId}`}>
          <p className="font-bold text-gray-800 text-sm hover:text-[#9D4D76] transition-colors truncate">
            {f.patientName}
          </p>
        </Link>
        <p className="text-xs text-gray-400 truncate">{f.treatmentApplied}</p>
      </div>

      {/* Fecha */}
      <div className="text-right flex-shrink-0 mr-2">
        <p className={cn(
          "text-xs font-black",
          variant === "overdue" ? "text-red-500" : "text-blue-500"
        )}>
          {dayLabel}
        </p>
        <p className="text-[10px] text-gray-400">{dateLabel}</p>
      </div>

      {/* WhatsApp */}
      {f.phone && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors"
          title="Enviar recordatorio por WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTADO "TODO AL DÍA"
// ─────────────────────────────────────────────

function AllClearState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-6">
      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
        <CheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <div>
        <p className="font-bold text-gray-700">¡Todo al día!</p>
        <p className="text-xs text-gray-400 mt-1">
          No hay citas vencidas ni recordatorios pendientes en los próximos 14 días.
        </p>
      </div>
    </div>
  );
}
