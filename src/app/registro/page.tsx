'use client';

import dynamic from 'next/dynamic';

const Wizard = dynamic(() => import('@/components/registro/Wizard'), {
    ssr: false
});

export default function RegistroPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
            {/* Header Simple */}
            <div className="max-w-3xl mx-auto mb-10 text-center space-y-2">
                <div className="w-40 h-24 relative flex items-center justify-center mx-auto mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-Somos Dos Studio.png" alt="Somos Dos Studio" className="object-contain w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white/90">Proyecto Estudio Digital</h1>
                <p className="text-slate-400">Somos Dos Studio - Estudio Avanzado</p>
            </div>

            <Wizard />

            {/* Footer */}
            <div className="max-w-3xl mx-auto mt-12 text-center text-slate-500 text-xs">
                <p>© 2026 Somos Dos Studio Estudio. Todos los derechos reservados.</p>
            </div>
        </div>
    );
}
