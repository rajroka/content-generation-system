import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  // FIX 1: In newer Clerk versions, auth() is asynchronous
  const { userId } = await auth();

  if (!code || !userId) return new Response("Auth failed", { status: 400 });

  try {
    // 1. Exchange code for Access Token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`;
    
    const res = await fetch(tokenUrl);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Failed to fetch token");

    // FIX 2: Change 'connectedAccount' to 'socialAccount' to match your schema
    await prisma.socialAccount.upsert({
      where: { 
        userId_platform: { 
          userId, 
          platform: "FACEBOOK" 
        } 
      },
      update: { 
        accessToken: data.access_token, 
        isActive: true 
      },
      create: { 
        userId, 
        platform: "FACEBOOK", 
        accessToken: data.access_token, 
        isActive: true 
      },
    });

    // 3. Close the popup and tell the UI it's done
    return new Response(`
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: "SOCIAL_CONNECTED" }, "*");
        }
        window.close();
      </script>
    `, { headers: { "Content-Type": "text/html" } });

  } catch (error) {
    console.error("Facebook Auth Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}