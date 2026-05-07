export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Twitter OAuth 2.0 uses PKCE. We generate a code_verifier, derive a
// code_challenge from it, and store the verifier in a cookie so the
// callback can use it to exchange the code for a token.

function base64URLEncode(buffer: ArrayBuffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generatePKCE() {
  // code_verifier: 32 random bytes → base64url
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const codeVerifier = base64URLEncode(verifierBytes.buffer);

  // code_challenge: SHA-256 of verifier → base64url
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64URLEncode(digest);

  return { codeVerifier, codeChallenge };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { codeVerifier, codeChallenge } = await generatePKCE();

  // Encode both userId and codeVerifier into state so the callback has
  // everything it needs without relying on cookies (cookies are dropped
  // on cross-site redirects from Twitter back to localhost).
  // Format: <clerkUserId>.<codeVerifier>
  // The codeVerifier itself is already a random base64url string, so it
  // also serves as the CSRF token.
  const state = `${userId}.${codeVerifier}`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: process.env.TWITTER_REDIRECT_URI!,
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
