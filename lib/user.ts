// lib/user.ts
import prisma from "@/lib/prisma";

export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: { clerkId },
  });
}