"use client";

import {
  Check,
  ExternalLink,
  FileText,
  Loader2,
  Ban,
  Trash2,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  approveSupplierAction,
  getUsersAction,
  rejectSupplierAction,
  banUserAction,
  unbanUserAction,
  deleteUserAction,
  changeUserRoleAction,
} from "./actions";

type UserWithProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  supplierProfile: {
    tin: string;
    description: string;
    certificationUrl: string;
    phoneNumber: string;
    approvalStatus: string;
    rejectionReason: string | null;
  } | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsersAction();
      setUsers(data as UserWithProfile[]);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleApprove(user: UserWithProfile) {
    if (!confirm(`Are you sure you want to approve ${user.name}?`)) return;

    setActionLoading(true);
    try {
      const result = await approveSupplierAction(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Supplier approved successfully");
        loadUsers();
        setIsDetailsDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to approve supplier");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedUser || !rejectReason) return;

    setActionLoading(true);
    try {
      const result = await rejectSupplierAction(selectedUser.id, rejectReason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Supplier rejected successfully");
        loadUsers();
        setIsRejectDialogOpen(false);
        setIsDetailsDialogOpen(false);
        setRejectReason("");
      }
    } catch (error) {
      toast.error("Failed to reject supplier");
    } finally {
      setActionLoading(false);
    }
  }

  function openDetails(user: UserWithProfile) {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  }

  function openRejectDialog(user: UserWithProfile) {
    setSelectedUser(user);
    setRejectReason("");
    setIsRejectDialogOpen(true);
  }

  async function handleBanUser(user: UserWithProfile) {
    if (!confirm(`Are you sure you want to ban ${user.name || user.email}?`))
      return;

    setActionLoading(true);
    try {
      const result = await banUserAction(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User banned successfully");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to ban user");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnbanUser(user: UserWithProfile) {
    if (!confirm(`Are you sure you want to unban ${user.name || user.email}?`))
      return;

    setActionLoading(true);
    try {
      const result = await unbanUserAction(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User unbanned successfully");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to unban user");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser(user: UserWithProfile) {
    if (
      !confirm(
        `Are you sure you want to DELETE ${user.name || user.email}? This action cannot be undone!`,
      )
    )
      return;

    setActionLoading(true);
    try {
      const result = await deleteUserAction(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted successfully");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    setActionLoading(true);
    try {
      const result = await changeUserRoleAction(userId, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User role changed successfully");
        loadUsers();
      }
    } catch (error) {
      toast.error("Failed to change user role");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <Button onClick={loadUsers} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <div className="max-w-7xl mx-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === "supplier" && user.supplierProfile ? (
                      <Badge
                        variant={
                          user.supplierProfile.approvalStatus === "approved"
                            ? "default"
                            : user.supplierProfile.approvalStatus === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {user.supplierProfile.approvalStatus}
                      </Badge>
                    ) : (
                      <Badge variant={user.banned ? "destructive" : "outline"}>
                        {user.banned ? "Banned" : "Active"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Role Change Dropdown */}
                      <Select
                        value={user.role}
                        onValueChange={(newRole) =>
                          handleChangeRole(user.id, newRole)
                        }
                        disabled={actionLoading}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {user.role === "supplier" && user.supplierProfile && (
                            <>
                              <DropdownMenuItem
                                onClick={() => openDetails(user)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {user.banned ? (
                            <DropdownMenuItem
                              onClick={() => handleUnbanUser(user)}
                              disabled={actionLoading}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleBanUser(user)}
                              disabled={actionLoading}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Supplier Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Supplier Application: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Review the supplier's details and certification.
            </DialogDescription>
          </DialogHeader>

          {selectedUser?.supplierProfile && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">TIN</Label>
                  <p className="font-medium">
                    {selectedUser.supplierProfile.tin}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone Number</Label>
                  <p className="font-medium">
                    {selectedUser.supplierProfile.phoneNumber}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Business Description
                </Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">
                  {selectedUser.supplierProfile.description}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Certification Document
                </Label>
                <div className="mt-2 border rounded-md p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Document Preview
                    </span>
                    <a
                      href={selectedUser.supplierProfile.certificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center hover:underline"
                    >
                      Open Original <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedUser.supplierProfile.certificationUrl}
                    alt="Certification"
                    className="max-h-60 object-contain mx-auto"
                  />
                </div>
              </div>

              {selectedUser.supplierProfile.approvalStatus === "rejected" && (
                <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  <Label className="text-destructive font-semibold">
                    Rejection Reason
                  </Label>
                  <p className="text-destructive text-sm mt-1">
                    {selectedUser.supplierProfile.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedUser?.supplierProfile?.approvalStatus === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => openRejectDialog(selectedUser)}
                  disabled={actionLoading}
                >
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleApprove(selectedUser)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Supplier
                </Button>
              </>
            )}
            {selectedUser?.supplierProfile?.approvalStatus === "rejected" && (
              <Button
                onClick={() => handleApprove(selectedUser)}
                disabled={actionLoading}
              >
                Re-Approve
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this supplier application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for Rejection</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid TIN, blurry certification document..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
