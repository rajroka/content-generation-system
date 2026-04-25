export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const rootUrl = "https://www.facebook.com/v18.0/dialog/oauth";
  const options = {
    client_id: process.env.FACEBOOK_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    // These are the scopes you just checked in the dashboard!
    scope: "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,pages_show_list",
    response_type: "code",
  };

  const q = new URLSearchParams(options).toString();
  return NextResponse.redirect(`${rootUrl}?${q}`);
}
