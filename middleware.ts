import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define route categories
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 2. Handle Public Routes
  if (isPublicRoute(req)) {
    if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      // Accessing publicMetadata directly to avoid undefined issues
      const role = user.publicMetadata?.role;
      
      const targetPath = role === "admin" ? "/admin" : "/user/dashboard";
      return NextResponse.redirect(new URL(targetPath, req.url));
    }
    return NextResponse.next();
  }

  // 3. Force login for protected routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Admin-only route protection
  if (isAdminRoute(req)) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Direct extraction
    const role = user.publicMetadata?.role;

    console.log("--- Middleware Security Check ---");
    console.log("User ID:", userId);
    console.log("Metadata Role:", role);

    if (role !== "admin") {
      console.log("Access Denied: Redirecting to user dashboard");
      return NextResponse.redirect(new URL("/user/dashboard", req.url));
    }
    
    return NextResponse.next();
  }

  // 5. Allow access to other authenticated routes (e.g., /user/dashboard)
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};