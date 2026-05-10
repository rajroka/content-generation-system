"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Search, MoreVertical, Eye, Crown, Ban, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    generations: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearch(query);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("API did not return an array of users:", data);
        setUsers([]);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      const response = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      if (response.ok) {
        toast.success(`User plan updated to ${plan}`);
        fetchUsers();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update plan");
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/users/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(`User ${!isActive ? "activated" : "deactivated"}`);
        fetchUsers();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered users and their accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 w-full sm:w-64"
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
                <TableHead>Plan</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.plan === "PRO" ? "default" : "secondary"}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{user._count.generations}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "destructive"}
                      className={user.isActive ? "bg-green-500" : ""}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdatePlan(user.id, "PRO")}>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePlan(user.id, "FREE")}>
                          Downgrade to Free
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.isActive)}>
                          <Ban className="w-4 h-4 mr-2" />
                          {user.isActive ? "Suspend" : "Activate"}
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
