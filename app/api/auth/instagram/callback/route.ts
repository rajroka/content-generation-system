import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/connections?error=instagram", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/connections?error=no_code", process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_message || "Failed to get access token");
    }

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
    );
    const userData = await userResponse.json();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Save or update social account
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: dbUser.id,
          platform: "INSTAGRAM",
        },
      },
      update: {
        accessToken: tokenData.access_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        accountId: userData.id,
        accountName: userData.username,
        isActive: true,
      },
      create: {
        userId: dbUser.id,
        platform: "INSTAGRAM",
        accessToken: tokenData.access_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        accountId: userData.id,
        accountName: userData.username,
        isActive: true,
      },
    });

    // Return success to popup
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connection Successful</title>
          <script>
            window.opener.postMessage({ type: 'SOCIAL_CONNECTED', platform: 'instagram' }, '*');
            window.close();
          </script>
        </head>
        <body>
          <p>Connection successful! You can close this window.</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
          <script>
            window.opener.postMessage({ type: 'SOCIAL_CONNECT_ERROR', error: '${error}' }, '*');
            window.close();
          </script>
        </head>
        <body>
          <p>Connection failed. Please try again.</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  }
}