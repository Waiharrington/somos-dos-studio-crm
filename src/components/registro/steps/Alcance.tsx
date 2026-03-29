import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Alcance() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Presupuesto */}
            <FormField
                control={control}
                name="scope.agreedBudget"
                render={({ field }) => (
                    <FormItem className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <FormLabel className="text-lg font-bold text-white">Presupuesto Acordado</FormLabel>
                        <p className="text-slate-400 text-sm mb-2">
                            Monto total (o aproximado) acordado con el cliente.
                        </p>
                        <FormControl>
                            <Input 
                                placeholder="Ej. $1,200 USD" 
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Modalidad de Pago */}
            <FormField
                control={control}
                name="scope.paymentMode"
                render={({ field }) => (
                    <FormItem className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <FormLabel className="text-lg font-bold text-white">Modalidad de Pago</FormLabel>
                        <p className="text-slate-400 text-sm mb-2">
                            Frecuencia o método de pago para el proyecto/servicio.
                        </p>
                        <FormControl>
                            <select 
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                            >
                                <option value="" className="bg-slate-900 text-slate-400">Selecciona una modalidad</option>
                                <option value="unico" className="bg-slate-900 text-white">Un solo pago</option>
                                <option value="quincenal" className="bg-slate-900 text-white">Quincenal</option>
                                <option value="semanal" className="bg-slate-900 text-white">Semanal</option>
                                <option value="personalizado" className="bg-slate-900 text-white">Personalizado</option>
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
