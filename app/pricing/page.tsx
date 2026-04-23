import { Pricing } from "@/componentss/landing/Pricing";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export default async function PricingPage() {
  const { userId } = await auth();

  let plan = "FREE";

  if (userId) {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    plan = user?.plan ?? "FREE";
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Pricing currentPlan={plan} />
    </main>
  );
}
