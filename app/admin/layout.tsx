export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/componentss/admin/AdminSidebar";
import { AdminNavbar } from "@/componentss/admin/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) redirect("/sign-in");
  
  // FETCH FRESH DATA (Do not rely on sessionClaims here)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role;
  
  if (role !== "admin") {
    console.log(`Unauthorized admin access attempt by user ${userId} with role ${role}`);
    redirect("/user/dashboard");
  }

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