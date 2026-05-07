export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const html = (type: string, extra?: Record<string, string>) => {
  const payload = JSON.stringify({ type, platform: "facebook", ...extra });
  return new Response(
    `<!DOCTYPE html>
<html>
  <head><title>${type === "SOCIAL_CONNECTED" ? "Connected" : "Failed"}</title></head>
  <body>
    <p>${type === "SOCIAL_CONNECTED" ? "Facebook connected! You can close this window." : "Connection failed. Please try again."}</p>
    <script>
      if (window.opener) window.opener.postMessage(${payload}, "*");
      window.close();
    </script>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Facebook OAuth error:", error);
    return html("SOCIAL_CONNECT_ERROR", { error });
  }

  if (!code || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_code_or_state" });
  }

  // state = encoded Clerk userId
  const clerkUserId = decodeURIComponent(state);

  try {
    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id",     process.env.FACEBOOK_CLIENT_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET!);
    tokenUrl.searchParams.set("redirect_uri",  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`);
    tokenUrl.searchParams.set("code",          code);

    const tokenRes  = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokenData.error?.message || "Failed to exchange code for token");
    }

    // Fetch the Facebook user's name for display
    const meRes  = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${tokenData.access_token}`);
    const meData = await meRes.json();

    // Resolve DB user by Clerk ID
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: {
        userId_platform: { userId: dbUser.id, platform: "FACEBOOK" },
      },
      update: {
        accessToken: tokenData.access_token,
        accountId:   meData.id   || null,
        accountName: meData.name || null,
        isActive:    true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "FACEBOOK",
        accessToken: tokenData.access_token,
        accountId:   meData.id   || null,
        accountName: meData.name || null,
        isActive:    true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("Facebook callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
