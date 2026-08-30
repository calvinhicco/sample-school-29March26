import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COOKIE_NAME } from "@/lib/schoolAuth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === "/report" || pathname.startsWith("/report/")) {
    const url = req.nextUrl.clone()
    url.pathname = "/parent/report"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/school") && !pathname.startsWith("/school/login")) {
    const cookie = req.cookies.get(COOKIE_NAME)
    if (!cookie || cookie.value !== "1") {
      const url = req.nextUrl.clone()
      url.pathname = "/school/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/report/:path*", "/school/:path*"],
}
