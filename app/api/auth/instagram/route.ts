export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  // Encode userId into state so the callback can identify the user
  // without relying on session cookies surviving the popup redirect.
  const state = encodeURIComponent(userId);

  const params = new URLSearchParams({
    client_id:     process.env.INSTAGRAM_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
    scope:         "instagram_basic,instagram_content_publish,pages_manage_posts",
    response_type: "code",
    state,
  });

  return NextResponse.redirect(`https://api.instagram.com/oauth/authorize?${params.toString()}`);
}
