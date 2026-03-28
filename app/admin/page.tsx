import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Image,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default async function AdminOverview() {
  // Fetch stats
  const [
    totalUsers,
    totalGenerations,
    totalImages,
    flaggedContent,
    proUsers,
    todayGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.generation.count(),
    prisma.generation.count({ where: { imageUrl: { not: null } } }),
    prisma.generation.count({ where: { isFlagged: true } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.generation.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: `${proUsers} Pro users`,
      trend: "+12%",
    },
    {
      title: "Total Generations",
      value: totalGenerations,
      icon: FileText,
      description: `${todayGenerations} today`,
      trend: "+8%",
    },
    {
      title: "Images Created",
      value: totalImages,
      icon: Image,
      description: "Total images generated",
      trend: "+15%",
    },
    {
      title: "Pro Conversion",
      value: `${((proUsers / totalUsers) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      description: `${proUsers} paying users`,
      trend: "+5%",
    },
    {
      title: "Flagged Content",
      value: flaggedContent,
      icon: AlertTriangle,
      description: "Needs review",
      trend: flaggedContent > 10 ? "+3" : "0",
      trendUp: false,
    },
    {
      title: "Monthly Revenue",
      value: `$${(proUsers * 9.99).toFixed(0)}`,
      icon: DollarSign,
      description: "Projected MRR",
      trend: "+23%",
    },
  ];

  // Recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      generations: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Recent generations
  const recentGenerations = await prisma.generation.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {user.plan}
                    </span>
                    {user.generations.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {user.generations.length} posts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGenerations.map((gen) => (
                <div key={gen.id} className="flex items-start gap-3 text-sm">
                  <Activity className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{gen.user?.email || "Unknown"}</p>
                    <p className="text-muted-foreground text-xs">
                      Generated {gen.platform.toLowerCase()} content: {gen.topic.slice(0, 50)}
                      {gen.topic.length > 50 ? "..." : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(gen.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {gen.isFlagged && (
                    <span className="text-xs text-red-500">⚠️ Flagged</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}