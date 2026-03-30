"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  UserCog,
  User,
  Loader2,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  emailVerified: string | null;
  createdAt: string;
  activated: boolean;
  bookingCount: number;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 border-red-200",
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  GUEST: "bg-green-100 text-green-800 border-green-200",
};

const roleIcons: Record<string, typeof Shield> = {
  ADMIN: Shield,
  STAFF: UserCog,
  GUEST: User,
};

export function UsersTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("GUEST");
  const [newPhone, setNewPhone] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data.users);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleCreateUser() {
    setCreating(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          phone: newPhone || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreateSuccess(`User ${newEmail} created. An invitation email has been sent.`);
        setNewName("");
        setNewEmail("");
        setNewRole("GUEST");
        setNewPhone("");
        fetchUsers();
        setTimeout(() => {
          setShowCreate(false);
          setCreateSuccess("");
        }, 2000);
      } else {
        setCreateError(data.error || "Failed to create user");
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with search and create */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="GUEST">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                />
              </div>

              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}
              {createSuccess && (
                <p className="text-sm text-green-600">{createSuccess}</p>
              )}

              <Button
                onClick={handleCreateUser}
                disabled={creating || !newName || !newEmail}
                className="w-full"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {creating ? "Creating..." : "Create & Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Users ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">User</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Bookings</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => {
                    const RoleIcon = roleIcons[user.role] || User;
                    return (
                      <tr key={user.id} className="hover:bg-secondary/30">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-foreground">{user.name || "—"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={roleColors[user.role]}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {user.activated ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Invited
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {user.bookingCount}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "ADMIN")}>
                                <Shield className="w-4 h-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "STAFF")}>
                                <UserCog className="w-4 h-4 mr-2" />
                                Make Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "GUEST")}>
                                <User className="w-4 h-4 mr-2" />
                                Make Guest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
