"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Flag, Trash2, Eye, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Generation {
  id: string;
  topic: string;
  caption: string;
  platform: string;
  tone: string;
  hashtags: string[];
  isFlagged: boolean;
  isDeleted: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminGenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "flagged" | "active">("all");

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch("/api/admin/generations");
      const data = await response.json();
      setGenerations(data);
    } catch (error) {
      toast.error("Failed to fetch generations");
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (id: string, flag: boolean) => {
    try {
      const response = await fetch("/api/admin/generations/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, flag }),
      });

      if (response.ok) {
        toast.success(flag ? "Content flagged" : "Flag removed");
        fetchGenerations();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const response = await fetch("/api/admin/generations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success("Content deleted");
        fetchGenerations();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  const filteredGenerations = generations.filter((gen) => {
    const matchesSearch = gen.topic.toLowerCase().includes(search.toLowerCase()) ||
                         gen.caption.toLowerCase().includes(search.toLowerCase()) ||
                         gen.user.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "flagged") return matchesSearch && gen.isFlagged;
    if (filter === "active") return matchesSearch && !gen.isFlagged && !gen.isDeleted;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage all generated content
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={filter === "flagged" ? "default" : "outline"}
                onClick={() => setFilter("flagged")}
              >
                Flagged
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by topic, caption, or user..."
                className="pl-9 w-full sm:w-80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Caption Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGenerations.map((gen) => (
                <TableRow key={gen.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{gen.user.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{gen.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[200px] truncate text-sm">{gen.topic}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{gen.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {gen.caption}
                    </p>
                  </TableCell>
                  <TableCell>
                    {gen.isFlagged ? (
                      <Badge variant="destructive">Flagged</Badge>
                    ) : gen.isDeleted ? (
                      <Badge variant="secondary">Deleted</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {!gen.isFlagged ? (
                          <DropdownMenuItem onClick={() => handleFlag(gen.id, true)}>
                            <Flag className="w-4 h-4 mr-2" />
                            Flag content
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleFlag(gen.id, false)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Remove flag
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(gen.id)}>
                          <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                          Delete content
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}