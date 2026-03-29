import { z } from "zod";

export const personalDataSchema = z.object({
    firstName: z.string().min(2, "El nombre es muy corto"),
    lastName: z.string().min(2, "El apellido es muy corto"),
    phone: z.string().min(7, "Teléfono inválido"),
    address: z.string().min(5, "Dirección requerida"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export const servicesSchema = z.object({
    selectedServices: z.array(z.string()).min(1, "Selecciona al menos un servicio"),
    agreedSummary: z.string().optional(),
});

export const scopeSchema = z.object({
    agreedBudget: z.string().optional(),
    paymentMode: z.string().optional(),
    customPaymentDetails: z.string().optional(),
});

export const treatmentSchema = z.object({
    objective: z.string().optional(),
    references: z.string().optional(),
});

// Esquema combinado para todo el formulario
export const clienteFormSchema = z.object({
    personal: personalDataSchema,
    discovery: servicesSchema,    // Rediseñado internamente a 'services' pero mantenemos nombre de propiedad para no romper Wizard sin querer
    scope: scopeSchema,
    treatment: treatmentSchema,   // Solo objetivo y referencias
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;

