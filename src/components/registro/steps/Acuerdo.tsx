import { useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eraser } from "lucide-react";

export default function FirmaDigital() {
    const { control, setValue } = useFormContext();
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = useCallback(() => {
        sigCanvas.current?.clear();
        setValue("signature.signatureData", "", { shouldValidate: true });
    }, [setValue]);

    const onEnd = useCallback(() => {
        if (sigCanvas.current) {
            const dataConfig = sigCanvas.current.toDataURL();
            setValue("signature.signatureData", dataConfig, { shouldValidate: true });
        }
    }, [setValue]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <FormLabel className="text-lg">Tu Firma</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-xs text-gray-400 hover:text-red-500">
                        <Eraser className="w-3 h-3 mr-1" /> Borrar
                    </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white/50 relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="#B34D7F"
                        canvasProps={{
                            className: "w-full h-48 cursor-crosshair"
                        }}
                        onEnd={onEnd}
                    />
                    <div className="absolute bottom-2 left-4 pointer-events-none text-[10px] text-gray-300">
                        Firma aquí con tu dedo
                    </div>
                </div>
                <FormField
                    control={control}
                    name="signature.signatureData"
                    render={({ field }) => (
                        <FormItem className="h-0 overflow-hidden">
                            <FormControl>
                                <input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10">
                <FormField
                    control={control}
                    name="signature.consent"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-base font-medium text-brand-primary">
                                    Acuerdo de Servicio y Confidencialidad
                                </FormLabel>
                                <p className="text-sm text-gray-500 leading-relaxed mt-2">
                                    Confirmo que la información proporcionada es correcta y acepto los términos de servicio de Somos Dos Studio. Entiendo que este acuerdo inicia la fase de descubrimiento y planificación del proyecto.
                                </p>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
            </div>

        </div>
    );
}
