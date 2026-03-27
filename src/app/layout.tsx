import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E8D5DF',
};

export const metadata: Metadata = {
  title: 'Somos Dos Studio - Estudio Avanzada',
  description: 'Plataforma de gestión estudio y estética',
  manifest: '/manifest.json',
  icons: {
    icon: '/somos-dos-app-icon.png',
    shortcut: '/somos-dos-app-icon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Somos Dos Studio',
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
    <html lang="es" className="antialiased">
      <body className={cn(inter.className, "bg-[#FDF7FA] min-h-screen overflow-x-hidden max-w-[100vw]")}>
        {/* Fondo decorativo sutil */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#E8D5DF_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-somos-dos-light/20 to-transparent -z-10 pointer-events-none"></div>

        <main className="relative flex flex-col min-h-screen">
          <Toaster position="top-center" richColors />
          {children}
        </main>
      </body>
    </html>
  );
}
