import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/componentss/admin/AdminSidebar";
import { AdminNavbar } from "@/componentss/admin/AdminNavbar";
import prisma from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) redirect("/sign-in");
  
  // Check if user is admin
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/dashboard");
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}