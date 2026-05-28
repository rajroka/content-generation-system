"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { AlertTriangle, CheckCircle2, FileText, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Generation {
  id: string;
  topic: string;
  platform: string;
  caption: string;
  hashtags: string[];
  imageUrl: string | null;
  isFlagged: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
}

function StatCard({
  title,
  value,
  icon: Icon,
  danger,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <Card className="border-none shadow-sm rounded-lg">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold tabular-nums ${danger ? "text-destructive" : ""}`}>
            {value}
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminContentPage() {
  const searchParams = useSearchParams();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [selected, setSelected] = useState<Generation | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchGenerations = async () => {
    try {
      const res = await fetch("/api/admin/generations");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch");
      setGenerations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch content");
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGenerations(); }, []);
  useEffect(() => { setSearch(searchParams.get("q") || ""); }, [searchParams]);

  const flaggedCount = generations.filter((g) => g.isFlagged).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return generations.filter((g) => {
      const matchFilter = filter === "all" || g.isFlagged;
      const matchSearch =
        g.topic.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q) ||
        g.user?.email.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [filter, generations, search]);

  const handleFlag = async (g: Generation) => {
    setBusyId(g.id);
    try {
      const res = await fetch("/api/admin/generations/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id, flag: !g.isFlagged }),
      });
      if (!res.ok) throw new Error();
      toast.success(g.isFlagged ? "Unflagged" : "Flagged");
      setGenerations((prev) =>
        prev.map((item) => (item.id === g.id ? { ...item, isFlagged: !item.isFlagged } : item))
      );
      setSelected((prev) =>
        prev?.id === g.id ? { ...prev, isFlagged: !prev.isFlagged } : prev
      );
    } catch {
      toast.error("Failed to update flag");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (g: Generation) => {
    if (!window.confirm("Remove this generation from the admin view?")) return;
    setBusyId(g.id);
    try {
      const res = await fetch("/api/admin/generations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: g.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Removed");
      setGenerations((prev) => prev.filter((item) => item.id !== g.id));
      if (selected?.id === g.id) setSelected(null);
    } catch {
      toast.error("Failed to remove");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 animate-pulse">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="h-80 rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold">Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and moderate generated posts.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-[480px]">
          <StatCard title="Total" value={generations.length} icon={FileText} />
          <StatCard title="Clear" value={generations.length - flaggedCount} icon={CheckCircle2} />
          <StatCard title="Flagged" value={flaggedCount} icon={AlertTriangle} danger />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-base font-semibold">
                Generations ({filtered.length})
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="w-full pl-9 sm:w-56"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
                  <Button
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "flagged" ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setFilter("flagged")}
                  >
                    Flagged
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((g) => (
                  <TableRow
                    key={g.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(g)}
                  >
                    <TableCell>
                      <p className="max-w-[200px] truncate font-medium">{g.topic}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{g.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {g.user?.email || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={g.isFlagged ? "destructive" : "secondary"}>
                        {g.isFlagged ? "Flagged" : "Clear"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busyId === g.id}
                          onClick={() => handleFlag(g)}
                          title={g.isFlagged ? "Unflag" : "Flag"}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busyId === g.id}
                          onClick={() => handleDelete(g)}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <FileText className="mb-3 h-8 w-8" />
                <p className="font-medium">No content found</p>
                <p className="text-sm">Try a different search or filter.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Topic</p>
                  <p className="font-medium">{selected.topic}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Platform</p>
                  <Badge variant="secondary">{selected.platform}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">User</p>
                  <p className="text-sm">{selected.user?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Caption</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">{selected.caption}</p>
                </div>
                {selected.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {selected.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.imageUrl}
                    alt={selected.topic}
                    className="max-h-48 w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1"
                    variant={selected.isFlagged ? "outline" : "destructive"}
                    disabled={busyId === selected.id}
                    onClick={() => handleFlag(selected)}
                  >
                    {selected.isFlagged ? "Unflag" : "Flag"}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    disabled={busyId === selected.id}
                    onClick={() => handleDelete(selected)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click a row to review the full caption, hashtags, and moderation actions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
