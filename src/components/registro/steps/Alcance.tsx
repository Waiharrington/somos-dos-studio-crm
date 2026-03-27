import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export default function Alcance() {
    const { control } = useFormContext();

    const hasBudget = useWatch({ control, name: "scope.hasBudget" });
    const isNewBusiness = useWatch({ control, name: "scope.isNewBusiness" });

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Presupuesto */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="scope.hasBudget"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-base font-bold m-0 text-gray-900">
                                ¿Tienes un presupuesto definido para este proyecto?
                            </FormLabel>
                        </FormItem>
                    )}
                />

                <AnimatePresence>
                    {hasBudget && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-7 pt-2"
                        >
                            <FormField
                                control={control}
                                name="scope.budgetRange"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-900 font-semibold">Rango estimado de inversión</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. $2,000 - $5,000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tipo de Negocio */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="scope.isNewBusiness"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-base font-bold m-0 text-gray-900">
                                ¿Es un negocio / startup nueva?
                            </FormLabel>
                        </FormItem>
                    )}
                />
            </div>

            {/* Audiencia Objetivo */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="scope.targetAudience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold text-gray-900">
                                ¿Cuál es tu audiencia objetivo?
                            </FormLabel>
                            <FormDescription className="text-gray-600 font-medium">
                                Describe a quién va dirigido el producto.
                            </FormDescription>
                            <FormControl>
                                <Textarea placeholder="Ej. Jóvenes de 18-25 años interesados en tecnología..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Competidores */}
            <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20">
                <FormField
                    control={control}
                    name="scope.mainCompetitors"
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
                                    ¿Ya tienes competidores directos identificados?
                                </FormLabel>
                                <FormDescription className="text-gray-600 font-medium">
                                    Menciona nombres o links si es posible.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
            </div>

        </div>
    );
}
