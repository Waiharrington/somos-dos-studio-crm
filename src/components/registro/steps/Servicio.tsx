import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Smartphone, Cpu, Palette, Database, BarChart3, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    { id: "webapp", label: "Web Apps", icon: Code2, color: "bg-violet-100 text-violet-600 border-violet-200" },
    { id: "mobile", label: "Mobile Apps", icon: Smartphone, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { id: "ai", label: "AI & Automation", icon: Cpu, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    { id: "design", label: "UI/UX Design", icon: Palette, color: "bg-pink-100 text-pink-600 border-pink-200" },
    { id: "backend", label: "Backend & API", icon: Database, color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
    { id: "consulting", label: "Consultoría", icon: BarChart3, color: "bg-amber-100 text-amber-600 border-amber-200" },
    { id: "other", label: "Otro Proyecto", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600 border-gray-200" },
];

export default function Servicio() {
    const { control, setValue } = useFormContext();
    const serviceType = useWatch({ control, name: "treatment.treatmentType" });

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">

            <div className="space-y-4">
                <FormLabel className="text-xl font-bold bg-gradient-to-r from-brand-primary to-emerald-400 bg-clip-text text-transparent">
                    ¿Qué tipo de proyecto iniciaremos?
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => setValue("treatment.treatmentType", s.id, { shouldValidate: true })}
                            className={cn(
                                "cursor-pointer rounded-2xl p-4 border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95",
                                serviceType === s.id
                                    ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/10"
                                    : "border-transparent bg-white shadow-sm hover:shadow-md"
                            )}
                        >
                            <div className={cn("p-3 rounded-full transition-colors", s.color)}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("font-medium text-sm text-center", serviceType === s.id ? "text-brand-primary font-bold" : "text-gray-700 font-semibold")}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <FormField
                    control={control}
                    name="treatment.treatmentType"
                    render={({ field }) => (
                        <FormItem className="h-0 overflow-hidden">
                            <FormControl>
                                <input {...field} hidden />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <AnimatePresence mode="wait">
                {serviceType && serviceType !== "other" && (
                    <motion.div
                        key="project-details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 pt-6 border-t border-gray-100"
                    >
                        <h3 className="font-bold text-brand-primary text-xl flex items-center gap-2">
                             Detalles del Proyecto
                        </h3>

                        <FormField
                            control={control}
                            name="treatment.objective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-900">¿Cuál es el objetivo principal del proyecto?</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe qué quieres lograr..." {...field} className="min-h-[100px] rounded-2xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="treatment.references"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-900">¿Tienes algún referente o competencia?</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Links de referencia, apps similares..." {...field} className="min-h-[100px] rounded-2xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                )}

                {serviceType === "other" && (
                    <motion.div
                        key="other-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 pt-6 border-t border-gray-100"
                    >
                        <h3 className="font-bold text-gray-600 text-xl">Otro Requerimiento</h3>
                        <FormField
                            control={control}
                            name="treatment.otherDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-gray-900">Cuéntanos más sobre tu idea</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe tu proyecto aquí..." {...field} className="min-h-[120px] rounded-2xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
