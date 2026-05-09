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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Zernio appends these to the redirect_url on success
  const connected  = searchParams.get("connected");   // "instagram"
  const accountId  = searchParams.get("accountId");   // Zernio account _id
  const username   = searchParams.get("username");
  const state      = searchParams.get("state");        // our Clerk userId
  const error      = searchParams.get("error");

  if (error) {
    console.error("Zernio Instagram callback error:", error);
    const errorMessages: Record<string, string> = {
      access_denied:  "Instagram connection was cancelled.",
      token_expired:  "Instagram token expired. Please try again.",
      no_pages:       "No Instagram Business/Creator account found. Personal accounts cannot be connected.",
    };
    return html("SOCIAL_CONNECT_ERROR", { error: errorMessages[error] || `Instagram connection failed: ${error}` });
  }

  if (!connected || !accountId || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_params" });
  }

  const clerkUserId = state;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: dbUser.id, platform: "INSTAGRAM" } },
      update: {
        accountId,
        accountName: username || null,
        accessToken: accountId, // Zernio manages the actual token; store account ID as reference
        isActive:    true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "INSTAGRAM",
        accountId,
        accountName: username || null,
        accessToken: accountId,
        isActive:    true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("Instagram callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
