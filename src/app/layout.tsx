import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#030014',
};

export const metadata: Metadata = {
  title: 'Somos Dos Studio - CRM Estudio Avanzada',
  description: 'Plataforma de gestión tecnológica para Somos Dos Studio',
  manifest: '/manifest.json',
  icons: {
    icon: '/somos-dos-app-icon.png',
    shortcut: '/somos-dos-app-icon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Somos Dos CRM',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("antialiased", inter.variable, jakarta.variable)}>
      <body className={cn(
        "bg-brand-dark min-h-screen overflow-x-hidden max-w-[100vw] selection:bg-brand-primary/30 selection:text-white"
      )}>
        {/* Background Atmosphere Layers */}
        <div className="fixed inset-0 -z-30 h-full w-full bg-[#030014]"></div>
        
        {/* Main Brand Glow Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow-purple -z-20 opacity-40 blur-[120px]"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] radial-glow-blue -z-20 opacity-30 blur-[100px]"></div>
        
        {/* Subtle SVG Grid Overlay */}
        <div className="fixed inset-0 -z-10 h-full w-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #7427A5 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>

        <main className="relative flex flex-col min-h-screen">
          <Toaster position="top-center" richColors theme="dark" />
          {children}
        </main>
      </body>
    </html>
  );
}
