export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";

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

  const connected = searchParams.get("connected");
  const accountId = searchParams.get("accountId");
  const username  = searchParams.get("username");
  const state     = searchParams.get("state");
  const error     = searchParams.get("error");
  const profileId = searchParams.get("profileId"); // Capture Zernio profile ID

  if (error) {
    console.error("Zernio Facebook callback error:", error);
    // Map known Zernio error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      no_facebook_pages: "No Facebook Page found. You need a Facebook Page (not a personal profile) to connect. Create one at facebook.com/pages/create.",
      access_denied:     "Facebook connection was cancelled.",
      token_expired:     "Facebook token expired. Please try again.",
    };
    const friendlyError = errorMessages[error] || `Facebook connection failed: ${error}`;
    return html("SOCIAL_CONNECT_ERROR", { error: friendlyError });
  }

  if (!connected || !accountId || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_params" });
  }

  const clerkUserId = state;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: dbUser.id, platform: "FACEBOOK" } },
      update: {
        accountId,
        accountName: username || null,
        accessToken: accountId,
        zernioProfileId: profileId || null,
        isActive:    true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "FACEBOOK",
        accountId,
        accountName: username || null,
        accessToken: accountId,
        zernioProfileId: profileId || null,
        isActive:    true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("Facebook callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
