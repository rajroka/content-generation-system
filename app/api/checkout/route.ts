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

    // 1. Get or create user in your DB
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email || `user_${userId}@fallback.com`,
          name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        },
      });
    }

    // 2. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email, 
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Plan",
              description: "Unlimited access to all features",
            },
            unit_amount: 1200, // $12.00
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { 
        userId: user.id // Using the Prisma ID to match your webhook
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.redirect(new URL("/pricing?error=failed", process.env.NEXT_PUBLIC_APP_URL!));
  }
}



// 78