import { useFormContext } from "react-hook-form";
import { type ClienteFormData } from "@/lib/schemas";

// Helper para mostrar booleanos
const YesNo = ({ val }: { val: boolean }) => (
    <span className={val ? "text-emerald-600 font-bold" : "text-gray-400 font-medium"}>
        {val ? "SÍ" : "No"}
    </span>
);

export default function Resumen() {
    const { getValues } = useFormContext<ClienteFormData>();
    const data = getValues();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

            <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/20 space-y-4">
                <h3 className="font-bold text-lg text-brand-primary">Datos del Cliente</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-700 font-semibold">Nombre:</div>
                    <div className="font-bold text-gray-900">{data.personal.firstName} {data.personal.lastName}</div>

                    <div className="text-gray-700 font-semibold">ID/Cédula:</div>
                    <div className="font-bold text-gray-900">{data.personal.idNumber}</div>

                    <div className="text-gray-700 font-semibold">Email:</div>
                    <div className="font-bold text-gray-900">{data.personal.email || "N/A"}</div>

                    <div className="text-gray-700 font-semibold">Teléfono:</div>
                    <div className="font-bold text-gray-900">{data.personal.phone}</div>
                </div>
            </div>

            <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 space-y-4">
                <h3 className="font-bold text-lg text-violet-700">Descubrimiento Técnico</h3>
                <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="flex justify-between border-b border-violet-200 pb-2">
                        <span className="text-gray-800 font-semibold">Código Existente</span>
                        <div className="text-right">
                            <YesNo val={data.discovery.hasExistingCode} />
                            {data.discovery.hasExistingCode && <div className="text-xs text-gray-600 mt-1">{data.discovery.existingCodeDetails}</div>}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-violet-200 pb-2">
                        <span className="text-gray-800 font-semibold">Stack Específico</span>
                        <div className="text-right">
                            <YesNo val={data.discovery.hasSpecificTechStack} />
                            {data.discovery.hasSpecificTechStack && <div className="text-xs text-gray-600 mt-1">{data.discovery.techStackDetails}</div>}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-violet-200 pb-2">
                        <span className="text-gray-800 font-semibold">Diseño Figma</span>
                        <div className="text-right">
                            <YesNo val={data.discovery.hasFigmaDesign} />
                            {data.discovery.hasFigmaDesign && <div className="text-xs text-gray-600 mt-1 truncate max-w-[200px]">{data.discovery.figmaLink}</div>}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-violet-200 pb-2">
                        <span className="text-gray-800 font-semibold">Urgencia / Deadline</span>
                        <div className="text-right">
                            <YesNo val={data.discovery.isUrgent} />
                            {data.discovery.isUrgent && <div className="text-xs text-gray-600 mt-1">{data.discovery.deadlineDetails}</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                <h3 className="font-bold text-lg text-emerald-700">Alcance y Negocio</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-800 font-semibold">Presupuesto:</span>
                    <div className="text-right">
                        <YesNo val={data.scope.hasBudget} />
                        {data.scope.hasBudget && <span className="block text-xs text-gray-600 mt-1">{data.scope.budgetRange}</span>}
                    </div>

                    <span className="text-gray-800 font-semibold">Nueva Startup:</span>
                    <YesNo val={data.scope.isNewBusiness} />
                </div>
            </div>

            <div className="bg-brand-primary p-6 rounded-2xl border border-brand-primary/20 space-y-4 shadow-lg shadow-brand-primary/10">
                <h3 className="font-bold text-lg text-white">Servicio Seleccionado</h3>
                <div className="text-2xl font-bold text-white capitalize mb-4">
                    {data.treatment.treatmentType === "webapp" ? "Web App Development" :
                        data.treatment.treatmentType === "mobile" ? "Mobile App Development" :
                            data.treatment.treatmentType === "ai" ? "AI & Automation" :
                                data.treatment.treatmentType === "design" ? "UI/UX Design" :
                                    data.treatment.treatmentType === "backend" ? "Backend & API" :
                                        data.treatment.treatmentType === "consulting" ? "Consultoría" : "Otro Proyecto"}
                </div>

                <div className="mt-2 text-sm bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-3">
                    <div>
                        <span className="block text-white font-bold mb-1">Objetivo del Proyecto:</span>
                        <p className="text-white/90 bg-black/5 p-2 rounded-lg">{data.treatment.objective || "Sin especificar"}</p>
                    </div>
                    <div>
                        <span className="block text-white font-bold mb-1">Referencias:</span>
                        <p className="text-white/90 bg-black/5 p-2 rounded-lg">{data.treatment.references || "Ninguna"}</p>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-500 p-6 rounded-2xl border border-emerald-600 flex items-center justify-between shadow-lg shadow-emerald-500/10">
                <div>
                    <h3 className="font-bold text-white">Acuerdo de Servicio</h3>
                    <p className="text-xs text-white/80 mt-1">Firma capturada y aceptada legalmente.</p>
                </div>
                <div className="bg-white p-2 rounded border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.signature.signatureData} alt="Firma" className="h-12 w-auto object-contain" />
                </div>
            </div>

        </div>
    );
}
