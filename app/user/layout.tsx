import { Sidebar } from "@/componentss/dashboard/Sidebar";
import { DashboardNavbar } from "@/componentss/dashboard/DashboardNavbar";
import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const { userId } = await auth();
  if (!user || !userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { plan: true }
  });
  const plan = dbUser?.plan || "FREE";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar plan={plan} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar plan={plan} />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}