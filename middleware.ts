import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/api/webhooks/stripe", // Stripe Webhook must be public
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // 1. If it's a public route, let it pass immediately
  // This is crucial for the Stripe Webhook to work perfectly
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Protect all other routes (Force login)
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 3. Admin route protection logic
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};