"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUserRole } from "@/app/actions/update-user-role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Role } from "@/lib/roles";

interface RoleSwitcherProps {
  userId: string;
  currentRole: Role;
}

export function RoleSwitcher({ userId, currentRole }: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const _getRoleOptions = () => {
    const options: Role[] = ["professional", "supplier", "buyer"];
    return options.filter((role) => role !== currentRole);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Role:</span>
      <Select
        value={currentRole}
        onValueChange={handleRoleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[120px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="buyer">Buyer</SelectItem>
          <SelectItem value="professional">Professional</SelectItem>
          <SelectItem value="supplier">Supplier</SelectItem>
          {currentRole === "admin" && (
            <SelectItem value="admin">Admin</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
