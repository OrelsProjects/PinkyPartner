import createMiddleware from "next-intl/middleware";

const middleware = createMiddleware({
  // Add locales you want in the app
  locales: ["en", "de", "es"],

  // Default locale if no match
  defaultLocale: "en",
  localePrefix: "always",
});

export default middleware;

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/",
    "/(de|es|en)/:page*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // However, match all pathnames within `/users`, optionally with a locale prefix
    // "/([\\w-]+)?/users/(.+)",
  ],
};

/**
 * import { getServerSession } from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

const internationalizationMiddleware = createMiddleware({
  locales: ["en", "de", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});

async function sessionMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected routes
  const protectedRoutes = ["/contract", "/obligation"];
  const isProtectedRoute = protectedRoutes.some(
    path =>
      pathname.startsWith(path) ||
      pathname.startsWith(`/${req.nextUrl.locale}${path}`),
  );

  if (isProtectedRoute) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Continue processing other requests as normal
  return NextResponse.next();
}

export function middleware(req: NextRequest) {
  const intlResponse = internationalizationMiddleware(req);
  if (intlResponse) return intlResponse;

  return sessionMiddleware(req);
}

export default middleware;

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/",
    "/(de|es|en)/:page*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // However, match all pathnames within `/users`, optionally with a locale prefix
    // "/([\\w-]+)?/users/(.+)",
  ],
};

 */
