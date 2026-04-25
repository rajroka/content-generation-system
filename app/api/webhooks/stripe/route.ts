export const dynamic = "force-dynamic";

import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  const userId = session.metadata?.userId;

  switch (event.type) {
    case "checkout.session.completed":
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: session.customer,
          },
        });
      }
      break;

    case "invoice.payment_succeeded":
      if (session.customer) {
        await prisma.user.update({
          where: { stripeCustomerId: session.customer },
          data: { plan: "PRO" },
        });
      }
      break;

    case "customer.subscription.deleted":
      await prisma.user.update({
        where: { stripeCustomerId: session.customer },
        data: { plan: "FREE" },
      });
      break;
  }

  return new NextResponse("Webhook handled", { status: 200 });
}


// 68
