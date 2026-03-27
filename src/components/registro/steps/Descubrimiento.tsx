import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export default function Descubrimiento() {
    const { control } = useFormContext();

    const hasExistingCode = useWatch({ control, name: "discovery.hasExistingCode" });
    const hasSpecificTechStack = useWatch({ control, name: "discovery.hasSpecificTechStack" });
    const hasFigmaDesign = useWatch({ control, name: "discovery.hasFigmaDesign" });
    const isUrgent = useWatch({ control, name: "discovery.isUrgent" });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Código Existente */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="discovery.hasExistingCode"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-bold text-gray-900">
                                    ¿Ya existe una versión previa o código base?
                                </FormLabel>
                                <FormDescription className="text-gray-600 font-medium">
                                    Si es una migración o rediseño de un sistema actual.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <AnimatePresence>
                    {hasExistingCode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-7 pt-2"
                        >
                            <FormField
                                control={control}
                                name="discovery.existingCodeDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 font-semibold">Detalles del sistema actual</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Ej. Repositorio actual, tecnologías usadas..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tech Stack */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="discovery.hasSpecificTechStack"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-bold text-gray-900">
                                    ¿Tienes preferencia por algún Stack Técnico?
                                </FormLabel>
                                <FormDescription className="text-gray-600 font-medium">
                                    Next.js, Python, Supabase, AWS, etc.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <AnimatePresence>
                    {hasSpecificTechStack && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-7 pt-2"
                        >
                            <FormField
                                control={control}
                                name="discovery.techStackDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 font-semibold">Especifica las tecnologías</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Requerimos usar PostgreSQL y React Native..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Diseño Figma */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="discovery.hasFigmaDesign"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-bold text-gray-900">
                                    ¿Ya cuentas con el diseño (Figma/Adobe XD)?
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <AnimatePresence>
                    {hasFigmaDesign && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-7 pt-2"
                        >
                            <FormField
                                control={control}
                                name="discovery.figmaLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 font-semibold">Link del diseño</FormLabel>
                                        <FormControl>
                                            <Input placeholder="URL de Figma..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Urgencia */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="discovery.isUrgent"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-bold text-gray-900">
                                    ¿El proyecto tiene una fecha límite estricta?
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <AnimatePresence>
                    {isUrgent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-7 pt-2"
                        >
                            <FormField
                                control={control}
                                name="discovery.deadlineDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 font-semibold">Indica la fecha y motivo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Lanzamiento en 3 meses por evento..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
