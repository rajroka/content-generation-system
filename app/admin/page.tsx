import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const dynamic = "force-dynamic";

function TrendBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
      <TrendingUp className="w-3 h-3" /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
      <TrendingDown className="w-3 h-3" /> {value}%
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
      <Minus className="w-3 h-3" /> 0%
    </span>
  );
}

function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminOverview() {
  // Re-verify admin — server components don't re-run the layout guard
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  if (clerkUser.publicMetadata?.role !== "admin") redirect("/user/dashboard");

  // Date ranges
  const now        = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const todayStart     = new Date(now.setHours(0, 0, 0, 0));

  const [
    totalUsers,
    totalGenerations,
    proUsers,
    todayGenerations,
    usersThisMonth,
    usersLastMonth,
    generationsThisMonth,
    generationsLastMonth,
    proUsersLastMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.generation.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.generation.count({ where: { isDeleted: false, createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.generation.count({ where: { isDeleted: false, createdAt: { gte: thisMonthStart } } }),
    prisma.generation.count({ where: { isDeleted: false, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    // Approximate last month's pro users by counting users who joined before this month
    prisma.user.count({ where: { plan: "PRO", createdAt: { lt: thisMonthStart } } }),
  ]);

  const stats = [
    {
      title:       "Total Users",
      value:       totalUsers,
      icon:        Users,
      description: `${usersThisMonth} new this month`,
      trend:       pct(usersThisMonth, usersLastMonth),
      href:        "/admin/users",
    },
    {
      title:       "Total Generations",
      value:       totalGenerations,
      icon:        FileText,
      description: `${todayGenerations} today`,
      trend:       pct(generationsThisMonth, generationsLastMonth),
      href:        "/admin/content",
    },
    {
      title:       "Monthly Revenue",
      value:       `$${(proUsers * 12).toFixed(0)}`,
      icon:        DollarSign,
      description: `${proUsers} Pro users`,
      trend:       pct(proUsers, proUsersLastMonth),
      href:        "/admin/subscriptions",
    },
  ];

  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      email:     true,
      plan:      true,
      createdAt: true,
      _count:    { select: { generations: true } },
    },
  });

  // Recent generations
  const recentGenerations = await prisma.generation.findMany({
    where:   { isDeleted: false },
    take:    10,
    orderBy: { createdAt: "desc" },
    select: {
      id:        true,
      topic:     true,
      platform:  true,
      isFlagged: true,
      createdAt: true,
      user:      { select: { email: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of platform activity and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <TrendBadge value={stat.trend} />
                  </div>
                </div>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users?q=${encodeURIComponent(user.email)}`}
                  className="flex items-center justify-between border-b pb-4 last:border-0 rounded-md transition hover:bg-muted/60 px-1"
                >
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {user.plan}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user._count.generations} gen
                    </span>
                  </div>
                </Link>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGenerations.map((gen) => (
                <Link
                  key={gen.id}
                  href={`/admin/content?q=${encodeURIComponent(gen.topic)}`}
                  className="flex items-start gap-3 border-b pb-4 last:border-0 rounded-md transition hover:bg-muted/60 px-1"
                >
                  <Activity className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{gen.user?.email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Generated {gen.platform.toLowerCase()} content: {gen.topic}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(gen.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {gen.isFlagged && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600 shrink-0">
                      Flagged
                    </span>
                  )}
                </Link>
              ))}
              {recentGenerations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
