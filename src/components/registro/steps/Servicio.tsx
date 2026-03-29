import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function Servicio() {
    const { control } = useFormContext();

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
            <FormField
                control={control}
                name="treatment.objective"
                render={({ field }) => (
                    <FormItem className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <FormLabel className="text-lg font-bold text-white">Objetivo Principal</FormLabel>
                        <p className="text-slate-400 text-sm mb-2">
                            Describe qué se quiere lograr exactamente con el proyecto.
                        </p>
                        <FormControl>
                            <Textarea 
                                placeholder="Ej. Aumentar las ventas con una nueva campaña de ads, crear una web para reservas..." 
                                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="treatment.references"
                render={({ field }) => (
                    <FormItem className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <FormLabel className="text-lg font-bold text-white">Referentes o Competencia</FormLabel>
                        <p className="text-slate-400 text-sm mb-2">
                            Links de referencia, cuentas de Instagram similares, paleta de colores o estilos preferidos.
                        </p>
                        <FormControl>
                            <Textarea 
                                placeholder="Ej. Perfil de @ejemplo, colores oscuros, web de competencia directa..." 
                                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl"
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
