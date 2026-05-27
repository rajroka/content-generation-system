import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define route categories
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/auth/redirect",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
  // OAuth initiation routes — opened in popups where session cookie may not be sent
  // These routes do their own auth() check internally and redirect to /sign-in if needed
  "/api/auth/instagram(.*)",
  "/api/auth/facebook(.*)",
  "/api/auth/youtube(.*)",
  "/api/auth/tiktok(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 2. Handle Public Routes
  if (isPublicRoute(req)) {
    if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      // Send logged in users to /auth/redirect to handle role-based routing
      return NextResponse.redirect(new URL("/auth/redirect", req.url));
    }
    return NextResponse.next();
  }

  // 3. Force login for protected routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 4. For /admin routes, we let the app/admin/layout.tsx handle the authorization.
  // The layout is a Server Component and can safely use clerkClient.

  // 5. Allow access to other authenticated routes (e.g., /user/dashboard)
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};