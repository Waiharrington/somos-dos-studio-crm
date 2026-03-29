import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getClienteByPhoneAction } from "@/app/actions/clientes";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User } from "lucide-react";

export default function DatosPersonales() {
    const { control, watch, setValue } = useFormContext();
    const phone = watch("personal.phone");
    const [foundClient, setFoundClient] = useState<{ name: string; id: string } | null>(null);

    useEffect(() => {
        const checkPhone = async () => {
            // Limpiar teléfono de espacios o caracteres no numéricos para la búsqueda si es necesario
            const cleanPhone = phone?.replace(/\s+/g, "");
            if (cleanPhone && cleanPhone.length >= 8) {
                const res = await getClienteByPhoneAction(phone);
                if (res.success && res.data) {
                    setFoundClient({
                        name: `${res.data.first_name} ${res.data.last_name}`,
                        id: res.data.id_number
                    });
                    // Auto-completar nombre y apellido si están vacíos
                    const currentFirstName = watch("personal.firstName");
                    const currentLastName = watch("personal.lastName");
                    if (!currentFirstName) setValue("personal.firstName", res.data.first_name);
                    if (!currentLastName) setValue("personal.lastName", res.data.last_name);
                } else {
                    setFoundClient(null);
                }
            } else {
                setFoundClient(null);
            }
        };

        const timer = setTimeout(checkPhone, 500);
        return () => clearTimeout(timer);
    }, [phone, setValue, watch]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Campo Nombre del Proyecto */}
            <FormField
                control={control}
                name="personal.projectName"
                render={({ field }) => (
                    <FormItem className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/20">
                        <FormLabel className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Identificador del Proyecto *</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Ej. Rediseño Web 2024 o Campaña ADS Mayo" 
                                className="bg-transparent border-none text-xl font-bold placeholder:text-slate-600 focus-visible:ring-0 p-0 h-auto"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="personal.firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. María" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="personal.lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Apellido *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="personal.phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="+58 412..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="personal.address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ciudad del cliente *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej. Caracas, Las Mercedes" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="personal.email"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="maria@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Notificación de Cliente Encontrado */}
            <AnimatePresence>
                {foundClient && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/5"
                    >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-emerald-400 font-bold text-sm">Cliente Identificado</p>
                            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mt-0.5">
                                {foundClient.name} • {foundClient.id}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                Enlazando este proyecto al expediente existente...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
