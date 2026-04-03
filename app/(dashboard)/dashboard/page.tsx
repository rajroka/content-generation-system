import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Image, History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  const stats = [
    {
      title: "Captions Generated",
      value: "0",
      description: "Today",
      icon: <Sparkles className="w-4 h-4 text-primary" />,
    },
    {
      title: "Images Created",
      value: "0",
      description: "Today",
      icon: <Image className="w-4 h-4 text-primary" />,
    },
    {
      title: "Total Generations",
      value: "0",
      description: "All time",
      icon: <History className="w-4 h-4 text-primary" />,
    },
    {
      title: "Current Plan",
      value: "Free",
      description: "5 captions/day",
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon}
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start generating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Create your first AI-powered caption and image in seconds.
            </p>
            <Button className="w-fit">
              <Link href="/generate">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate content
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily usage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Captions</span>
              <span className="font-medium">0 / 5</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-0" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Images</span>
              <span className="font-medium">0 / 3</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-0" />
            </div>
            <Button  variant="outline" className="w-fit mt-1">
              <Link href="/pricing">Upgrade for unlimited</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}