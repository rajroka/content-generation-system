export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import zernio from "@/lib/zernio";
import { getZernioProfileId } from "@/lib/zernio-profiles";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  try {
    const profileId = await getZernioProfileId();
    const result = await zernio.connect.getConnectUrl({
      path:  { platform: "instagram" },
      query: {
        profileId,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback?state=${encodeURIComponent(userId)}`,
      },
    });

    const authUrl = result.data?.authUrl;
    if (!authUrl) throw new Error("No authUrl returned from Zernio");

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("Zernio Instagram connect error:", err.message);
    const msg = err.message || "Failed to connect Instagram";
    return new Response(
      `<!DOCTYPE html><html><body><script>
        if (window.opener) window.opener.postMessage(${JSON.stringify({ type: "SOCIAL_CONNECT_ERROR", platform: "instagram", error: msg })}, "*");
        window.close();
      </script></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
