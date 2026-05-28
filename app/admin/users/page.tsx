"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
import { Search, MoreVertical, Eye, Ban, Mail, RefreshCw, Users, ShieldCheck, UserX } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  plan: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    generations: number;
  };
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("API did not return an array of users:", data);
        setUsers([]);
      }
    } catch {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/users/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(`User ${!isActive ? "activated" : "deactivated"}`);
        setUsers((current) =>
          current.map((user) => (user.id === userId ? { ...user, isActive: !isActive } : user))
        );
        setSelectedUser((current) =>
          current?.id === userId ? { ...current, isActive: !isActive } : current
        );
      } else {
        throw new Error("Failed to update");
      }
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const activeUsers = safeUsers.filter((user) => user.isActive).length;
  const adminUsers = safeUsers.filter((user) => user.role === "ADMIN").length;
  const suspendedUsers = safeUsers.length - activeUsers;

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();

    return safeUsers.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.plan?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [safeUsers, search]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-40" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage account access, status, and support actions.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{safeUsers.length}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{adminUsers}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{suspendedUsers}</p>
            </div>
            <UserX className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base font-bold">All Users ({filteredUsers.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers} aria-label="Refresh users">
                <RefreshCw className="w-4 h-4" />
              </Button>
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
                        {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name || user.email} />}
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
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.assign(`mailto:${user.email}`)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Email User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={updatingId === user.id}
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                        >
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
          {filteredUsers.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No users found</p>
              <p className="text-sm">Try another search term.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle>User Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</p>
                <p className="mt-1 font-medium">{selectedUser.name || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access</p>
                <div className="mt-2 flex gap-2">
                  <Badge>{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.isActive ? "default" : "destructive"}>
                    {selectedUser.isActive ? "Active" : "Suspended"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
                <p className="mt-1 font-medium">{selectedUser.plan}</p>
                <p className="text-sm text-muted-foreground">{selectedUser._count.generations} generations</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dates</p>
                <p className="mt-1 text-sm">Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Updated {new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedUser.isActive ? "destructive" : "default"}
                disabled={updatingId === selectedUser.id}
                onClick={() => handleToggleActive(selectedUser.id, selectedUser.isActive)}
              >
                {selectedUser.isActive ? "Suspend User" : "Activate User"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.location.assign(`mailto:${selectedUser.email}`)}
              >
                Email User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
