export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  // Encode userId into state (same pattern as Twitter) so the callback
  // can identify the user without relying on session cookies surviving
  // the cross-site redirect inside a popup window.
  const state = encodeURIComponent(userId);

  const rootUrl = "https://www.facebook.com/v18.0/dialog/oauth";
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    scope: "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list,pages_manage_metadata",
    response_type: "code",
    state,
  });

  return NextResponse.redirect(`${rootUrl}?${params.toString()}`);
}
