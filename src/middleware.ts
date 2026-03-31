import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Usamos getSession en el middleware para mayor velocidad y evitar Timeouts en Vercel.
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // ─────────────────────────────────────────────
    // PROTECCIÓN DEL PANEL ADMIN
    // ─────────────────────────────────────────────
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    if (request.nextUrl.pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    // ─────────────────────────────────────────────
    // PROTECCIÓN DEL PORTAL DE CLIENTE
    // ─────────────────────────────────────────────
    const portalSession = request.cookies.get('portal_session')?.value;

    if (request.nextUrl.pathname.startsWith('/portal')) {
        // Permitir acceso a la página de login si no hay sesión
        if (request.nextUrl.pathname === '/portal/login') {
            if (portalSession) {
                return NextResponse.redirect(new URL('/portal/dashboard', request.url))
            }
            return response;
        }

        // Proteger el resto de las rutas del portal
        if (!portalSession) {
            return NextResponse.redirect(new URL('/portal/login', request.url))
        }
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/portal/:path*'],
}
