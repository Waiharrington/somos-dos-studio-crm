import { useFormContext, Controller } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const predefinedServices = [
    { id: "edicion", label: "Ediciones de videos" },
    { id: "guionizacion", label: "Guionización / Dirección de video" },
    { id: "contenidos", label: "Plan de contenidos" },
    { id: "web", label: "Página web / Landing Page" },
    { id: "consultoria", label: "Consultoría / Asesoría" },
    { id: "ia", label: "Automatización / IA" },
    { id: "ads", label: "Gestión de ADS" },
    { id: "software", label: "Sistema personalizado (Software o CRM)" },
    { id: "fotos", label: "Sesiones de fotos / Fotografía" },
];

export default function Descubrimiento() {
    const { control } = useFormContext();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Servicios Múltiples */}
            <FormField
                control={control}
                name="discovery.selectedServices"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-xl font-bold text-white">Servicios Acordados</FormLabel>
                            <p className="text-slate-400 text-sm">
                                Selecciona todos los servicios que se le ofrecerán al cliente.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {predefinedServices.map((service) => (
                                <Controller
                                    key={service.id}
                                    control={control}
                                    name="discovery.selectedServices"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={service.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-xl p-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(service.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), service.id])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== service.id
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-semibold text-slate-200 cursor-pointer w-full">
                                                    {service.label}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Resumen de lo acordado */}
            <FormField
                control={control}
                name="discovery.agreedSummary"
                render={({ field }) => (
                    <FormItem className="pt-4 border-t border-white/10">
                        <FormLabel className="text-xl font-bold text-white">Resumen de lo Acordado</FormLabel>
                        <p className="text-slate-400 text-sm mb-3">
                            Describe exactamente qué se acordó, qué se ofreció y cómo se planteó el proyecto.
                        </p>
                        <FormControl>
                            <Textarea 
                                placeholder="Ej. Se acordó la creación de una landing page en 2 semanas, con 3 revisiones mensuales y gestión de redes (3 posts/semana)..." 
                                className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl"
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
