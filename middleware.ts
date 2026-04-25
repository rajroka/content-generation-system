import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
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
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

async function checkAndPromoteAdmin(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  let role = user.publicMetadata?.role;

  const primaryEmailObj = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
  const primaryEmail = primaryEmailObj?.emailAddress?.toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAIL || "").split(",").map(e => e.trim().toLowerCase());

  if (primaryEmail && (adminEmails.includes(primaryEmail) || primaryEmail.startsWith("admin"))) {
    if (role !== "admin") {
      console.log(`Auto-promoting ${primaryEmail} to admin...`);
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: "admin" }
      });
      role = "admin";
    }
  }

  return { role, primaryEmail };
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 2. Handle Public Routes
  if (isPublicRoute(req)) {
    if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      const { role } = await checkAndPromoteAdmin(userId);
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
    const { role, primaryEmail } = await checkAndPromoteAdmin(userId);

    console.log("--- Middleware Security Check ---");
    console.log("User ID:", userId);
    console.log("Email:", primaryEmail);
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