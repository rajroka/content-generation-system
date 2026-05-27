export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL!));
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL!));
    }

    // If user has no Stripe customer ID, they haven't subscribed yet — send to pricing
    if (!user.stripeCustomerId) {
      return NextResponse.redirect(new URL("/pricing", process.env.NEXT_PUBLIC_APP_URL!));
    }

    // Create a Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (err: any) {
    console.error("Billing portal error:", err);
    return NextResponse.redirect(
      new URL("/user/dashboard?error=billing-portal-failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
