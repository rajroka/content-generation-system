"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Activity, Clock, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userEmail: string;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearch(query);

    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/admin/activity");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch activity");
        }

        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch activity");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase();

    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.userEmail.toLowerCase().includes(query)
    );
  }, [logs, search]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/4 rounded bg-muted" />
          <div className="h-96 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="mt-1 text-muted-foreground">Recent platform events and user activity</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            className="w-full pl-9 md:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-4 border-b pb-4 last:border-0">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0d7c8a]/10 text-[#0d7c8a]">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{log.action}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {log.userEmail}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{log.details}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No activity found</p>
              <p className="text-sm">Try another search term.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
