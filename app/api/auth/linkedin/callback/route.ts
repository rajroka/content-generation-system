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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const connected = searchParams.get("connected");
  const accountId = searchParams.get("accountId");
  const username  = searchParams.get("username");
  const state     = searchParams.get("state");
  const error     = searchParams.get("error");

  if (error) {
    console.error("Zernio LinkedIn callback error:", error);
    const errorMessages: Record<string, string> = {
      access_denied: "LinkedIn connection was cancelled.",
      token_expired: "LinkedIn token expired. Please try again.",
    };
    return html("SOCIAL_CONNECT_ERROR", { error: errorMessages[error] || `LinkedIn connection failed: ${error}` });
  }

  if (!connected || !accountId || !state) {
    return html("SOCIAL_CONNECT_ERROR", { error: "missing_params" });
  }

  const clerkUserId = state;

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!dbUser) throw new Error("User not found in database");

    await prisma.socialAccount.upsert({
      where: { userId_platform: { userId: dbUser.id, platform: "LINKEDIN" } },
      update: {
        accountId,
        accountName: username || null,
        accessToken: accountId,
        isActive:    true,
      },
      create: {
        userId:      dbUser.id,
        platform:    "LINKEDIN",
        accountId,
        accountName: username || null,
        accessToken: accountId,
        isActive:    true,
      },
    });

    return html("SOCIAL_CONNECTED");
  } catch (err: any) {
    console.error("LinkedIn callback error:", err.message);
    return html("SOCIAL_CONNECT_ERROR", { error: err.message });
  }
}
