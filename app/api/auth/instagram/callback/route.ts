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
  <p>${success ? "Instagram connected! You can close this window." : "Connection failed. Please try again."}</p>
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
  const state        = searchParams.get("state");
  const error        = searchParams.get("error");
  const profileId    = searchParams.get("profileId");
  const connectToken = searchParams.get("connect_token");
  const accountId    = searchParams.get("accountId");
  const username     = searchParams.get("username");

  if (error) {
    const msgs: Record<string, string> = {
      access_denied: "Instagram connection was cancelled.",
      token_expired: "Instagram token expired. Please try again.",
      no_pages:      "No Instagram Business/Creator account found. Personal accounts cannot be connected.",
    };
    return html("SOCIAL_CONNECT_ERROR", "instagram", { error: msgs[error] || `Instagram connection failed: ${error}` });
  }

  if (!connected || !state) {
    return html("SOCIAL_CONNECT_ERROR", "instagram", { error: "Missing required callback parameters." });
  }

  const account = await resolveZernioAccount("instagram", {
    accountId, connectToken, profileId, username,
  });

  if (!account) {
    return html("SOCIAL_CONNECT_ERROR", "instagram", { error: "Could not retrieve Instagram account from Zernio." });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: state } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where:  { userId_platform: { userId: dbUser.id, platform: "INSTAGRAM" } },
      update: {
        accountId:       account.accountId,
        accountName:     account.accountName,
        accessToken:     account.accountId,
        zernioProfileId: profileId || null,
        isActive:        true,
      },
      create: {
        userId:          dbUser.id,
        platform:        "INSTAGRAM",
        accountId:       account.accountId,
        accountName:     account.accountName,
        accessToken:     account.accountId,
        zernioProfileId: profileId || null,
        isActive:        true,
      },
    });

    return html("SOCIAL_CONNECTED", "instagram");
  } catch (err: any) {
    console.error("Instagram callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", "instagram", { error: err.message });
  }
}
