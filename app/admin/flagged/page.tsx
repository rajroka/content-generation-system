"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FlaggedContent {
  id: string;
  topic: string;
  caption: string;
  platform: string;
  tone: string;
  hashtags: string[];
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminFlaggedPage() {
  const [flagged, setFlagged] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlagged();
  }, []);

  const fetchFlagged = async () => {
    try {
      const response = await fetch("/api/admin/generations/flagged");
      const data = await response.json();
      setFlagged(data);
    } catch (error) {
      toast.error("Failed to fetch flagged content");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch("/api/admin/generations/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, flag: false }),
      });

      if (response.ok) {
        toast.success("Content approved");
        fetchFlagged();
      }
    } catch (error) {
      toast.error("Failed to approve content");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this flagged content?")) return;

    try {
      const response = await fetch("/api/admin/generations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success("Content deleted");
        fetchFlagged();
      }
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Flagged Content Queue</h1>
            <p className="text-muted-foreground mt-1">
              Review and moderate content flagged by the system or users
            </p>
          </div>
        </div>
      </div>

      {flagged.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No flagged content</h3>
            <p className="text-muted-foreground text-sm">
              All content has been reviewed and approved
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flagged.map((content) => (
            <Card key={content.id} className="border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {content.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {content.user.name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {content.user.email}
                        </p>
                      </div>
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge variant="secondary">{content.tone}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(content.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Topic</p>
                        <p className="text-sm">{content.topic}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Caption</p>
                        <p className="text-sm">{content.caption}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hashtags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {content.hashtags.slice(0, 10).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(content.id)}
                      className="text-green-500"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(content.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}