export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Helper to return an HTML response that messages the opener popup
  const htmlResponse = (type: string, extra?: Record<string, string>) => {
    const payload = JSON.stringify({ type, platform: "twitter", ...extra });
    return new Response(
      `<!DOCTYPE html>
<html>
  <head><title>${type === "SOCIAL_CONNECTED" ? "Connection Successful" : "Connection Failed"}</title></head>
  <body>
    <p>${type === "SOCIAL_CONNECTED" ? "Connected! You can close this window." : "Connection failed. Please try again."}</p>
    <script>
      if (window.opener) {
        window.opener.postMessage(${payload}, "*");
      }
      window.close();
    </script>
  </body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  };

  if (error) {
    console.error("Twitter OAuth error param:", error);
    return htmlResponse("SOCIAL_CONNECT_ERROR", { error });
  }

  if (!code || !state) {
    return htmlResponse("SOCIAL_CONNECT_ERROR", { error: "missing_code_or_state" });
  }

  // State format: <clerkUserId>.<codeVerifier>
  // The first segment is the userId, everything after the first dot is
  // the codeVerifier (which is itself a base64url string with no dots).
  const dotIndex = state.indexOf(".");
  if (dotIndex === -1) {
    console.error("Twitter callback: malformed state param");
    return htmlResponse("SOCIAL_CONNECT_ERROR", { error: "malformed_state" });
  }
  const clerkUserId = state.substring(0, dotIndex);
  const codeVerifier = state.substring(dotIndex + 1);

  if (!clerkUserId || !codeVerifier) {
    console.error("Twitter callback: could not parse state param");
    return htmlResponse("SOCIAL_CONNECT_ERROR", { error: "invalid_state" });
  }

  try {
    // Exchange authorization code for access token.
    // Twitter requires Basic Auth (client_id:client_secret) for Confidential
    // Client apps even when using PKCE. The code_verifier still goes in the body.
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.TWITTER_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Twitter token exchange failed — status:", tokenResponse.status, "body:", JSON.stringify(tokenData));
      throw new Error(tokenData.error_description || tokenData.error || "Failed to get access token");
    }

    // Fetch the authenticated user's Twitter profile
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error("Twitter user fetch failed:", userData);
      throw new Error("Failed to fetch Twitter user info");
    }

    const twitterUser = userData.data; // { id, name, username }

    // Look up the internal DB user by Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!dbUser) {
      throw new Error("User not found in database");
    }

    // Persist the social account (upsert so reconnecting works cleanly)
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: dbUser.id,
          platform: "TWITTER",
        },
      },
      update: {
        accessToken: tokenData.access_token,
        // Store refresh token if provided (requires offline.access scope)
        ...(tokenData.refresh_token && { refreshToken: tokenData.refresh_token }),
        // Twitter OAuth 2.0 tokens expire in 2 hours by default
        ...(tokenData.expires_in && {
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        }),
        accountId: twitterUser.id,
        accountName: twitterUser.username,
        isActive: true,
      },
      create: {
        userId: dbUser.id,
        platform: "TWITTER",
        accessToken: tokenData.access_token,
        ...(tokenData.refresh_token && { refreshToken: tokenData.refresh_token }),
        ...(tokenData.expires_in && {
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        }),
        accountId: twitterUser.id,
        accountName: twitterUser.username,
        isActive: true,
      },
    });

    // Return success — postMessage to opener, then close popup
    return htmlResponse("SOCIAL_CONNECTED");
  } catch (err) {
    console.error("Twitter OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "unknown_error";
    return htmlResponse("SOCIAL_CONNECT_ERROR", { error: message });
  }
}
