import { z } from "zod";

export const personalDataSchema = z.object({
    firstName: z.string().min(2, "El nombre es muy corto"),
    lastName: z.string().min(2, "El apellido es muy corto"),
    phone: z.string().min(7, "Teléfono inválido"),
    address: z.string().min(5, "Dirección requerida"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export const projectDiscoverySchema = z.object({
    hasExistingCode: z.boolean().default(false),
    existingCodeDetails: z.string().optional(),
    hasSpecificTechStack: z.boolean().default(false),
    techStackDetails: z.string().optional(),
    hasFigmaDesign: z.boolean().default(false),
    figmaLink: z.string().optional(),
    isUrgent: z.boolean().default(false),
    deadlineDetails: z.string().optional(),
});

export const treatmentSchema = z.object({
    treatmentType: z.string().min(1, "Selecciona un servicio"),

    // Láser
    laserSunExposure: z.boolean().optional(),
    laserRetinoids: z.boolean().optional(),
    laserTattoos: z.boolean().optional(),

    // Rejuvenecimiento / Estético
    rejuvenationConcerns: z.string().optional(),
    rejuvenationPreviousTreatments: z.string().optional(),

    // Alias para uniformidad en el dashboard
    // Project specific data
    objective: z.string().optional(),
    references: z.string().optional(),

    // Corporal
    bodyConcerns: z.string().optional(),
    bodyGoals: z.string().optional(),
    bodyImplants: z.boolean().optional(), // Marcapasos, placas metálicas
    bodyPregnant: z.boolean().optional(), // Embarazo
    dietHabits: z.string().optional(),
    exerciseHabits: z.string().optional(),

    // Otro
    otherDescription: z.string().optional(),
});

export const signatureSchema = z.object({
    signatureData: z.string().min(1, "La firma es obligatoria"),
    consent: z.boolean().refine(val => val === true, "Debes aceptar el consentimiento"),
});

export const projectScopeSchema = z.object({
    hasBudget: z.boolean().default(false),
    budgetRange: z.string().optional(),
    isNewBusiness: z.boolean().default(true),
    targetAudience: z.string().optional(),
    mainCompetitors: z.string().optional(),
});

// Esquema combinado para todo el formulario
export const clienteFormSchema = z.object({
    personal: personalDataSchema,
    discovery: projectDiscoverySchema,
    scope: projectScopeSchema,
    treatment: treatmentSchema, // Mantener 'treatment' internamente por ahora para evitar romper demasiadas referencias
    signature: signatureSchema,
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;
