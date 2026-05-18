export const dynamic = "force-dynamic";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id":        svix_id!,
      "svix-timestamp": svix_timestamp!,
      "svix-signature": svix_signature!,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Set default role in Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, {
      publicMetadata: { role: "user" },
    });

    // Create the user record in our database
    const email = email_addresses?.[0]?.email_address ?? "";
    const name  = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.upsert({
      where:  { clerkId: id },
      update: { email, name, imageUrl: image_url ?? null },
      create: {
        clerkId:  id,
        email,
        name,
        imageUrl: image_url ?? null,
        plan:     "FREE",
        role:     "USER",
        isActive: true,
      },
    });
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? "";
    const name  = [first_name, last_name].filter(Boolean).join(" ") || null;

    await prisma.user.updateMany({
      where: { clerkId: id },
      data:  { email, name, imageUrl: image_url ?? null },
    });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.user.updateMany({
        where: { clerkId: id },
        data:  { isActive: false },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
