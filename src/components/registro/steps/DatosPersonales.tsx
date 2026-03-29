import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function DatosPersonales() {
    const { control } = useFormContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">

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
    );
}
