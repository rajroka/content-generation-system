import prisma from "@/lib/prisma";

export type AdminDateRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<AdminDateRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const PLAN_PRICE = 12;

function normalizeRange(range?: string | null): AdminDateRange {
  return range === "7d" || range === "90d" ? range : "30d";
}

function dateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function shortLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(date);
}

function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function makeRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const previousStart = new Date(start);
  previousStart.setDate(start.getDate() - days);

  const previousEnd = new Date(start);
  previousEnd.setMilliseconds(-1);

  return { start, end, previousStart, previousEnd };
}

export async function getAdminAnalytics(rangeParam?: string | null) {
  const range = normalizeRange(rangeParam);
  const days = RANGE_DAYS[range];
  const { start, previousStart, previousEnd } = makeRange(days);

  const buckets = new Map<
    string,
    { date: string; label: string; generations: number; newUsers: number; publishedPosts: number; scheduledPosts: number }
  >();

  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    buckets.set(dateKey(date), {
      date: dateKey(date),
      label: shortLabel(date),
      generations: 0,
      newUsers: 0,
      publishedPosts: 0,
      scheduledPosts: 0,
    });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    users,
    rangeUsers,
    previousUsers,
    generations,
    previousGenerations,
    scheduledPosts,
    previousScheduledPosts,
    activeConnections,
    recentGenerations,
  ] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { generations: true, scheduledPosts: true, socialAccounts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: previousStart, lte: previousEnd } },
    }),
    prisma.generation.findMany({
      where: { isDeleted: false, createdAt: { gte: start } },
      select: {
        id: true,
        topic: true,
        platform: true,
        imageUrl: true,
        isFlagged: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.generation.count({
      where: { isDeleted: false, createdAt: { gte: previousStart, lte: previousEnd } },
    }),
    prisma.scheduledPost.findMany({
      where: { createdAt: { gte: start } },
      select: {
        status: true,
        platforms: true,
        createdAt: true,
        scheduledFor: true,
        publishedAt: true,
      },
    }),
    prisma.scheduledPost.count({
      where: { createdAt: { gte: previousStart, lte: previousEnd } },
    }),
    prisma.socialAccount.count({ where: { isActive: true } }),
    prisma.generation.findMany({
      where: { isDeleted: false },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        topic: true,
        platform: true,
        isFlagged: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  rangeUsers.forEach((user) => {
    const bucket = buckets.get(dateKey(user.createdAt));
    if (bucket) bucket.newUsers += 1;
  });

  generations.forEach((generation) => {
    const bucket = buckets.get(dateKey(generation.createdAt));
    if (bucket) bucket.generations += 1;
  });

  scheduledPosts.forEach((post) => {
    const date = post.publishedAt ?? post.scheduledFor ?? post.createdAt;
    const bucket = buckets.get(dateKey(date));
    if (!bucket) return;

    if (post.status === "PUBLISHED") bucket.publishedPosts += 1;
    if (post.status === "SCHEDULED") bucket.scheduledPosts += 1;
  });

  const platformMap = new Map<string, number>();
  generations.forEach((generation) => {
    const platform = String(generation.platform);
    platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1);
  });

  scheduledPosts.forEach((post) => {
    post.platforms.forEach((platform) => {
      const key = String(platform);
      platformMap.set(key, (platformMap.get(key) ?? 0) + 1);
    });
  });

  const proUsers = users.filter((user) => user.plan === "PRO").length;
  const freeUsers = users.length - proUsers;
  const activeUsers = users.filter((user) => user.isActive).length;
  const flaggedContent = generations.filter((generation) => generation.isFlagged).length;
  const totalImages = generations.filter((generation) => generation.imageUrl).length;
  const publishedPosts = scheduledPosts.filter((post) => post.status === "PUBLISHED").length;
  const pendingScheduledPosts = scheduledPosts.filter((post) => post.status === "SCHEDULED").length;

  const proUsersAtMonthStart = users.filter(
    (user) => user.plan === "PRO" && user.createdAt < monthStart
  ).length;

  const revenueData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const proCount = users.filter(
      (user) => user.plan === "PRO" && user.createdAt <= new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    ).length;

    return {
      month: monthLabel(date),
      revenue: proCount * PLAN_PRICE,
      proUsers: proCount,
    };
  });

  const topUsers = users
    .slice()
    .sort((a, b) => b._count.generations + b._count.scheduledPosts - (a._count.generations + a._count.scheduledPosts))
    .slice(0, 5)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      generations: user._count.generations,
      scheduledPosts: user._count.scheduledPosts,
      socialAccounts: user._count.socialAccounts,
    }));

  return {
    range,
    totals: {
      totalUsers: users.length,
      activeUsers,
      proUsers,
      freeUsers,
      totalGenerations: generations.length,
      totalImages,
      publishedPosts,
      scheduledPosts: pendingScheduledPosts,
      flaggedContent,
      connectedAccounts: activeConnections,
      monthlyRevenue: proUsers * PLAN_PRICE,
    },
    trends: {
      users: pct(rangeUsers.length, previousUsers),
      generations: pct(generations.length, previousGenerations),
      scheduledPosts: pct(scheduledPosts.length, previousScheduledPosts),
      revenue: pct(proUsers, proUsersAtMonthStart),
    },
    dailyActivity: Array.from(buckets.values()),
    platformDistribution: Array.from(platformMap.entries()).map(([platform, count]) => ({
      platform,
      count,
    })),
    planDistribution: [
      { plan: "PRO", count: proUsers },
      { plan: "FREE", count: freeUsers },
    ],
    revenueData,
    recentUsers: users.slice(0, 5).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      generations: user._count.generations,
    })),
    recentActivity: recentGenerations.map((generation) => ({
      id: generation.id,
      topic: generation.topic,
      platform: generation.platform,
      isFlagged: generation.isFlagged,
      createdAt: generation.createdAt.toISOString(),
      userEmail: generation.user?.email ?? "Unknown",
      userName: generation.user?.name ?? null,
    })),
    topUsers,
    systemHealth: [
      {
        label: "Active accounts",
        value: activeUsers,
        total: users.length,
      },
      {
        label: "Connected socials",
        value: activeConnections,
        total: Math.max(users.length * 4, 1),
      },
      {
        label: "Moderation clear",
        value: Math.max(generations.length - flaggedContent, 0),
        total: Math.max(generations.length, 1),
      },
    ],
  };
}
