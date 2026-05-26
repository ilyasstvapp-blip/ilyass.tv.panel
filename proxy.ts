import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { locales, defaultLocale, isLocale } from "@/i18n/config"

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname

  // detect locale from path
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length > 0 && isLocale(segments[0])) {
    return segments[0]
  }

  // detect from cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale
  }

  // detect from browser
  const acceptLang = request.headers.get("accept-language") || ""
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase()
  if (preferred && isLocale(preferred)) {
    return preferred
  }

  return defaultLocale
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)

  // Skip non-page routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Handle admin-login and dashboard routes (no locale redirect)
  if (pathname.startsWith("/admin-login") || pathname.startsWith("/dashboard")) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin-login"
      return NextResponse.redirect(url)
    }

    if (user && pathname === "/admin-login") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // Locale redirect for public pages
  const locale = getLocale(request)

  if (segments.length === 0 || !isLocale(segments[0])) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
