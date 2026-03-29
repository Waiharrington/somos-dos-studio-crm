"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteFormSchema, type ClienteFormData } from "@/lib/schemas";
import DatosPersonales from "./steps/DatosPersonales";
import Descubrimiento from "./steps/Descubrimiento";
import Alcance from "./steps/Alcance";
import Servicio from "./steps/Servicio";
import { cn } from "@/lib/utils";
import { saveClienteAction } from "@/app/actions/clientes";
import { Loader2 } from "lucide-react";

const steps = [
    { id: "personal", title: "Datos Personales", component: DatosPersonales, fields: ["personal"] },
    { id: "discovery", title: "Servicios", component: Descubrimiento, fields: ["discovery"] },
    { id: "scope", title: "Alcance y Pago", component: Alcance, fields: ["scope"] },
    { id: "treatment", title: "Detalles", component: Servicio, fields: ["treatment"] },
];

export default function Wizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);

    const methods = useForm<ClienteFormData>({
        resolver: zodResolver(clienteFormSchema),
        mode: "onChange",
        defaultValues: {
            personal: {
                firstName: "",
                lastName: "",
                phone: "",
                address: "",
                email: "",
            },
            discovery: {
                selectedServices: [],
                agreedSummary: "",
            },
            scope: {
                agreedBudget: "",
                paymentMode: "",
                customPaymentDetails: "",
            },
            treatment: {
                objective: "",
                references: "",
            }
        }
    });

    const nextStep = async () => {
        const currentStepFields = steps[currentStep].fields;

        // Validar solo los campos del paso actual
        // @ts-expect-error - Trigger acepta path strings
        const isValid = await methods.trigger(currentStepFields.map(field => field));

        if (isValid) {
            if (currentStep < steps.length - 1) {
                setDirection(1);
                setCurrentStep((prev) => prev + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    const fillDemoData = () => {
        methods.setValue("personal.firstName", "Waiharrington");
        methods.setValue("personal.lastName", "Studio");
        methods.setValue("personal.phone", "+58 412 0000000");
        methods.setValue("personal.address", "Caracas, Las Mercedes");
        methods.setValue("personal.email", "info@somosdostudio.com");

        methods.setValue("discovery.selectedServices", ["webapp", "consulting"]);
        methods.setValue("discovery.agreedSummary", "Se acordó desarrollar un CRM y dar 2 horas de consultoría.");
        
        methods.setValue("scope.agreedBudget", "$5,000");
        methods.setValue("scope.paymentMode", "quincenal");

        methods.setValue("treatment.objective", "Build a scalable CRM for the studio.");
        methods.setValue("treatment.references", "https://notion.so, https://salesforce.com");
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0,
        }),
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: ClienteFormData) => {
        setIsSubmitting(true);
        try {
            const { success, error } = await saveClienteAction(data);

            if (success) {
                const end = Date.now() + 3 * 1000;
                const colors = ["#8B5CF6", "#10B981", "#FFFFFF"]; // Violet and Emerald

                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: colors,
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: colors,
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                })();

                toast.success("¡Proyecto Registrado!", {
                    description: "El nuevo cliente y su descubrimiento han sido guardados.",
                    duration: 5000,
                    style: {
                        background: "#F5F3FF",
                        border: "1px solid #DDD6FE",
                        color: "#7C3AED",
                    },
                    icon: "🚀",
                });

                // Limpiar el form o redirigir (opcional)
                // methods.reset();
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                toast.error("Error al guardar", {
                    description: error || "Hubo un problema al conectar con el servidor.",
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error inesperado", {
                description: "Por favor intenta de nuevo en unos minutos.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8 hidden md:block">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full" />
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2",
                                    index <= currentStep
                                        ? "bg-brand-primary border-brand-primary/20 text-white shadow-lg shadow-brand-primary/30"
                                        : "bg-slate-900 border-slate-800 text-slate-500"
                                )}
                            >
                                {index + 1}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium uppercase tracking-wider",
                                index <= currentStep ? "text-brand-400" : "text-slate-500"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:hidden mb-6 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                        Paso {currentStep + 1} de {steps.length}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-tight">
                        {steps[currentStep].title}
                    </h2>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold shadow-sm">
                    {currentStep + 1}
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] rounded-3xl p-6 md:p-10 min-h-[400px] relative overflow-hidden text-gray-100">
                        <button
                            type="button"
                            onClick={fillDemoData}
                            className="absolute top-2 right-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-300 transition-colors z-50 flex items-center gap-1"
                        >
                            ⚡ Demo
                        </button>

                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2 mb-6">
                                        <h2 className="text-2xl font-bold text-brand-primary">
                                            {steps[currentStep].title}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Ingresa los datos del cliente para iniciar su perfil digital.
                                        </p>
                                    </div>
                                    {React.createElement(steps[currentStep].component)}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={cn(
                                "text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5 pl-0 md:pl-4",
                                currentStep === 0 && "invisible"
                            )}
                        >
                            Atrás
                        </Button>

                        <div className="flex gap-4">
                            {currentStep === steps.length - 1 ? (
                                <Button
                                    type="button"
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 px-8 rounded-full"
                                    disabled={isSubmitting}
                                    onClick={methods.handleSubmit(onSubmit)}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Finalizar Descubrimiento"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 px-8 rounded-full"
                                >
                                    Siguiente
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
