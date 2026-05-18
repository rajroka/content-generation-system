export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { resolveZernioAccount } from "@/lib/zernio-callback";

const html = (type: string, platform: string, extra?: Record<string, string>) => {
  const payload = JSON.stringify({ type, platform, ...extra });
  const success = type === "SOCIAL_CONNECTED";
  return new Response(
    `<!DOCTYPE html><html>
<head><title>${success ? "Connected" : "Failed"}</title></head>
<body>
  <p>${success ? "Facebook connected! You can close this window." : "Connection failed. Please try again."}</p>
  <script>
    if (window.opener) window.opener.postMessage(${payload}, "*");
    setTimeout(() => window.close(), 500);
  </script>
</body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const connected    = searchParams.get("connected");
  const state        = searchParams.get("state");        // Clerk userId
  const error        = searchParams.get("error");
  const profileId    = searchParams.get("profileId");
  const connectToken = searchParams.get("connect_token");
  const accountId    = searchParams.get("accountId");
  const username     = searchParams.get("username");

  if (error) {
    const msgs: Record<string, string> = {
      no_facebook_pages: "No Facebook Page found. You need a Facebook Page (not a personal profile) to connect.",
      access_denied:     "Facebook connection was cancelled.",
      token_expired:     "Facebook token expired. Please try again.",
    };
    return html("SOCIAL_CONNECT_ERROR", "facebook", { error: msgs[error] || `Facebook connection failed: ${error}` });
  }

  if (!connected || !state) {
    return html("SOCIAL_CONNECT_ERROR", "facebook", { error: "Missing required callback parameters." });
  }

  // Resolve the Zernio account ID dynamically
  const account = await resolveZernioAccount("facebook", {
    accountId, connectToken, profileId, username,
  });

  if (!account) {
    return html("SOCIAL_CONNECT_ERROR", "facebook", { error: "Could not retrieve Facebook account from Zernio." });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: state } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where:  { userId_platform: { userId: dbUser.id, platform: "FACEBOOK" } },
      update: {
        accountId:       account.accountId,
        accountName:     account.accountName,
        accessToken:     account.accountId,
        zernioProfileId: profileId || null,
        isActive:        true,
      },
      create: {
        userId:          dbUser.id,
        platform:        "FACEBOOK",
        accountId:       account.accountId,
        accountName:     account.accountName,
        accessToken:     account.accountId,
        zernioProfileId: profileId || null,
        isActive:        true,
      },
    });

    return html("SOCIAL_CONNECTED", "facebook");
  } catch (err: any) {
    console.error("Facebook callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", "facebook", { error: err.message });
  }
}
