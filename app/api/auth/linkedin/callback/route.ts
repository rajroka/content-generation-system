export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";

const html = (type: string, extra?: Record<string, string>) => {
  const payload = JSON.stringify({ type, platform: "linkedin", ...extra });
  return new Response(
    `<!DOCTYPE html>
<html>
  <head><title>${type === "SOCIAL_CONNECTED" ? "Connected" : "Failed"}</title></head>
  <body>
    <p>${type === "SOCIAL_CONNECTED" ? "LinkedIn connected! You can close this window." : "Connection failed. Please try again."}</p>
    <script>
      if (window.opener) window.opener.postMessage(${payload}, "*");
      window.close();
    </script>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("LinkedIn OAuth error:", error);
    return html("SOCIAL_CONNECT_ERROR", { error });
  }

  if (!code || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_code_or_state" });
  }

  const clerkUserId = decodeURIComponent(state);

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
        client_id:     process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to get access token");
    }

    // Fetch LinkedIn profile using OpenID Connect userinfo endpoint
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const accountName = profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim() || null;
    const accountId   = profile.sub || null;

    // Resolve DB user
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: {
        userId_platform: { userId: dbUser.id, platform: "LINKEDIN" },
      },
      update: {
        accessToken: tokenData.access_token,
        ...(tokenData.expires_in && {
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        }),
        accountId,
        accountName,
        isActive: true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "LINKEDIN",
        accessToken: tokenData.access_token,
        ...(tokenData.expires_in && {
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        }),
        accountId,
        accountName,
        isActive: true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("LinkedIn callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
