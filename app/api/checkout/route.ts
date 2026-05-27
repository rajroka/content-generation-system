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

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    // Get or create user in DB
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId:  userId,
          email:    email || `user_${userId}@fallback.com`,
          name:     `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
          imageUrl: clerkUser?.imageUrl || null,
          plan:     "FREE",
        },
      });
    }

    // If already PRO, send to billing portal instead
    if (user.plan === "PRO" && user.stripeCustomerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer:   user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`,
      });
      return NextResponse.redirect(portalSession.url);
    }

    // Create or reuse Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email:    email,
        metadata: { userId: user.id, clerkId: userId },
      });
      stripeCustomerId = customer.id;
      // Persist the customer ID immediately so it's available for webhooks
      await prisma.user.update({
        where: { id: user.id },
        data:  { stripeCustomerId },
      });
    }

    // Create Stripe Checkout session — $10/month billed monthly
    const session = await stripe.checkout.sessions.create({
      customer:             stripeCustomerId,
      mode:                 "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency:     "usd",
            product_data: {
              name:        "PostSathi Pro",
              description: "Unlimited captions, unlimited scheduling, all platforms",
            },
            unit_amount: 1000, // $10.00
            recurring:   { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard?upgraded=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata:    { userId: user.id },
    });

    return NextResponse.redirect(session.url!);
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.redirect(
      new URL("/pricing?error=checkout-failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
