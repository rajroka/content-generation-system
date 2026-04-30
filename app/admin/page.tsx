import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";

export default async function AdminOverview() {
  // Fetch stats
  const [
    totalUsers,
    totalGenerations,
    proUsers,
    todayGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.generation.count(),
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <stat.icon size={20} className="text-[#0d7c8a]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0">
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
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGenerations.map((gen) => (
                <div key={gen.id} className="flex items-start gap-3 border-b pb-4 last:border-0">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}