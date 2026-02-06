"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserWithRole } from "@/lib/auth-utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (
    userId: string,
    newRole: "admin" | "professional" | "supplier",
  ) => {
    setUpdatingRole(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users found</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {user.name || "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) =>
                          updateUserRole(
                            user.id,
                            newRole as "admin" | "professional" | "supplier",
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingRole === user.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
