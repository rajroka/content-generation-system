export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";

const html = (type: string, extra?: Record<string, string>) => {
  const payload = JSON.stringify({ type, platform: "instagram", ...extra });
  return new Response(
    `<!DOCTYPE html>
<html>
  <head><title>${type === "SOCIAL_CONNECTED" ? "Connected" : "Failed"}</title></head>
  <body>
    <p>${type === "SOCIAL_CONNECTED" ? "Instagram connected! You can close this window." : "Connection failed. Please try again."}</p>
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
    console.error("Instagram OAuth error:", error);
    return html("SOCIAL_CONNECT_ERROR", { error });
  }

  if (!code || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_code_or_state" });
  }

  // state = encoded Clerk userId
  const clerkUserId = decodeURIComponent(state);

  try {
    // Exchange code for short-lived access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id:     process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type:    "authorization_code",
        redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_message || "Failed to get access token");
    }

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    const finalToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn  = longLivedData.expires_in   || tokenData.expires_in;

    // Fetch Instagram user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${finalToken}`
    );
    const userData = await userResponse.json();

    // Resolve DB user
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: {
        userId_platform: { userId: dbUser.id, platform: "INSTAGRAM" },
      },
      update: {
        accessToken: finalToken,
        expiresAt:   expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        accountId:   userData.id       || null,
        accountName: userData.username || null,
        isActive:    true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "INSTAGRAM",
        accessToken: finalToken,
        expiresAt:   expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        accountId:   userData.id       || null,
        accountName: userData.username || null,
        isActive:    true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("Instagram callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
