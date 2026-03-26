import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (userId) {
          // Update user plan to PRO
          await prisma.user.update({
            where: { clerkId: userId },
            data: { plan: "PRO" },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Get customer and find user to downgrade
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = (customer as any).metadata?.userId;

        if (userId) {
          // Downgrade to FREE
          await prisma.user.update({
            where: { clerkId: userId },
            data: { plan: "FREE" },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer) {
          // Update subscription status, ensure plan is still PRO
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          const userId = (customer as any).metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { clerkId: userId },
              data: { plan: "PRO" },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}