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
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-[12px] text-muted-foreground mt-1">
          Overview of platform activity and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <stat.icon size={16} className="text-[#0d7c8a]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <span className="text-[10px] text-muted-foreground">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-none shadow-sm rounded-xl p-5">
          <h3 className="text-xs font-bold text-foreground mb-5">Recent Users</h3>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{user.email}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {user.plan}
                    </span>
                    {user.generations.length > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                      {user.generations.length} posts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm rounded-xl p-5">
          <h3 className="text-xs font-bold text-foreground mb-5">Recent Activity</h3>
          <div className="space-y-3">
            {recentGenerations.map((gen) => (
              <div key={gen.id} className="flex items-start gap-3 text-sm">
                <Activity className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{gen.user?.email || "Unknown"}</p>
                  <p className="text-muted-foreground text-[11px] truncate">
                    Generated {gen.platform.toLowerCase()} content: {gen.topic}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(gen.createdAt).toLocaleString()}
                  </p>
                </div>
                {gen.isFlagged && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 shrink-0">
                    Flagged
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}