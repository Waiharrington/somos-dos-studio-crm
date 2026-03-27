"use client";

import { motion } from "framer-motion";
import { ChevronRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Cliente = {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  treatment_type: string;
  created_at: string;
  alert_level?: number;
};

export function RecentClientsList({ patients }: { patients: Cliente[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-gray-900">Registros Recientes</h3>
        <Link href="/admin/clientes" className="text-xs font-bold text-brand-primary hover:underline underline-offset-4">
          VER TODOS
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {patients.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400 italic">
            No hay registros recientes aún.
          </div>
        ) : (
          patients.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <Link href={`/admin/clientes/${p.id}`}>
                <div className="glass-card p-5 flex items-center gap-4 hover:shadow-xl hover:shadow-pink-200/20 transition-all border border-brand-primary/50/50 group-hover:border-brand-primary/200/60">
                  {/* Avatar Circular */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary-soft flex items-center justify-center text-brand-primary font-black text-lg border border-brand-primary/100/50 group-hover:scale-110 transition-transform">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-primary transition-colors">
                        {p.first_name} {p.last_name}
                      </h4>
                      {p.alert_level === 2 && (
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-gray-400 mt-1">
                      <span className="bg-brand-primary/100/50 text-brand-primary px-2 py-0.5 rounded-md">
                        {p.treatment_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 group-hover:bg-Somos Dos Studio-primary group-hover:text-white transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
