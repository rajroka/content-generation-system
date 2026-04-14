import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Payment successful → upgrade to PRO
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              stripeSubscriptionId: subscriptionId,
            },
          });
        }
        break;
      }

      // Subscription renewed — keep PRO active
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "PRO" },
        });
        break;
      }

      // Payment failed → downgrade to FREE
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "FREE" },
        });
        break;
      }

      // Subscription cancelled → downgrade to FREE
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      // Subscription updated (e.g. plan change)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // If active keep PRO, otherwise downgrade
        const plan = status === "active" || status === "trialing" ? "PRO" : "FREE";

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Required: disable body parsing so we get raw body for signature verification
export const config = {
  api: { bodyParser: false },
};