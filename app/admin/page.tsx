import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminOverviewClient } from "@/componentss/admin/AdminOverviewClient";
import { getAdminAnalytics } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") redirect("/user/dashboard");

  const data = await getAdminAnalytics("30d");

  return <AdminOverviewClient data={data} />;
}
