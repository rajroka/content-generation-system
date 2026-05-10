"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, Eye, FileText, Search, Trash2 } from "lucide-react";
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
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

export default function AdminContentPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [selected, setSelected] = useState<Generation | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchGenerations = async () => {
    try {
      const response = await fetch("/api/admin/generations");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch content");
      }

      setGenerations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch content");
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearch(query);
    fetchGenerations();
  }, []);

  const filteredGenerations = useMemo(() => {
    const query = search.toLowerCase();

    return generations.filter((generation) => {
      const matchesFilter = filter === "all" || generation.isFlagged;
      const matchesSearch =
        generation.topic.toLowerCase().includes(query) ||
        generation.caption.toLowerCase().includes(query) ||
        generation.platform.toLowerCase().includes(query) ||
        generation.user?.email.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, generations, search]);

  const flaggedCount = generations.filter((generation) => generation.isFlagged).length;

  const handleFlag = async (generation: Generation) => {
    setBusyId(generation.id);
    try {
      const response = await fetch("/api/admin/generations/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: generation.id, flag: !generation.isFlagged }),
      });

      if (!response.ok) throw new Error("Failed to update content flag");

      toast.success(generation.isFlagged ? "Content unflagged" : "Content flagged");
      setGenerations((current) =>
        current.map((item) =>
          item.id === generation.id ? { ...item, isFlagged: !item.isFlagged } : item
        )
      );
      setSelected((current) =>
        current?.id === generation.id ? { ...current, isFlagged: !current.isFlagged } : current
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update content");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (generation: Generation) => {
    const confirmed = window.confirm("Hide this generation from admin content lists?");
    if (!confirmed) return;

    setBusyId(generation.id);
    try {
      const response = await fetch("/api/admin/generations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: generation.id }),
      });

      if (!response.ok) throw new Error("Failed to delete content");

      toast.success("Content removed");
      setGenerations((current) => current.filter((item) => item.id !== generation.id));
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete content");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/4 rounded bg-muted" />
          <div className="h-80 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="mt-1 text-muted-foreground">Review generated posts, flags, and moderation actions</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{generations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Flagged</p>
              <p className="text-2xl font-bold text-red-600">{flaggedCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Generated Content ({filteredGenerations.length})</CardTitle>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    className="w-full pl-9 sm:w-64"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="flex rounded-lg border p-1">
                  <Button variant={filter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFilter("all")}>
                    All
                  </Button>
                  <Button variant={filter === "flagged" ? "default" : "ghost"} size="sm" onClick={() => setFilter("flagged")}>
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
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGenerations.map((generation) => (
                  <TableRow key={generation.id}>
                    <TableCell>
                      <div className="max-w-[260px]">
                        <p className="truncate font-medium">{generation.topic}</p>
                        <p className="truncate text-xs text-muted-foreground">{generation.caption}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{generation.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{generation.user?.email || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant={generation.isFlagged ? "destructive" : "secondary"}>
                        {generation.isFlagged ? "Flagged" : "Clear"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(generation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(generation)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={busyId === generation.id} onClick={() => handleFlag(generation)}>
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={busyId === generation.id} onClick={() => handleDelete(generation)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredGenerations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <FileText className="mb-3 h-8 w-8" />
                <p className="font-medium">No content found</p>
                <p className="text-sm">Try another search or filter.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic</p>
                  <p className="mt-1 font-medium">{selected.topic}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Caption</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{selected.caption}</p>
                </div>
                {selected.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selected.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {selected.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.imageUrl} alt={selected.topic} className="max-h-56 w-full rounded-lg object-cover" />
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" variant={selected.isFlagged ? "secondary" : "default"} onClick={() => handleFlag(selected)}>
                    {selected.isFlagged ? "Unflag" : "Flag"}
                  </Button>
                  <Button className="flex-1" variant="destructive" onClick={() => handleDelete(selected)}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a generated post to review the full caption, hashtags, image, and moderation actions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
