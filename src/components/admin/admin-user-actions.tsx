"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, Shield, Home, User, UserX, UserCheck, Trash2 } from "lucide-react";

type Role = "ADMIN" | "LANDLORD" | "USER";

interface AdminUserActionsProps {
  userId: string;
  role: Role;
  isActive: boolean;
  isSelf: boolean;
}

export function AdminUserActions({ userId, role, isActive, isSelf }: AdminUserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateUser = async (payload: Record<string, unknown>, successMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    const confirmed = window.confirm("Delete this user account permanently?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {role !== "USER" && (
          <DropdownMenuItem onClick={() => updateUser({ role: "USER" }, "User role updated to USER")}>
            <User className="h-4 w-4 mr-2" />
            Set as User
          </DropdownMenuItem>
        )}
        {role !== "LANDLORD" && (
          <DropdownMenuItem onClick={() => updateUser({ role: "LANDLORD" }, "User role updated to LANDLORD")}>
            <Home className="h-4 w-4 mr-2" />
            Set as Landlord
          </DropdownMenuItem>
        )}
        {role !== "ADMIN" && (
          <DropdownMenuItem onClick={() => updateUser({ role: "ADMIN" }, "User role updated to ADMIN")}>
            <Shield className="h-4 w-4 mr-2" />
            Set as Admin
          </DropdownMenuItem>
        )}

        {isActive ? (
          <DropdownMenuItem onClick={() => updateUser({ isActive: false }, "User deactivated")}>
            <UserX className="h-4 w-4 mr-2" />
            Deactivate User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => updateUser({ isActive: true }, "User activated")}>
            <UserCheck className="h-4 w-4 mr-2" />
            Activate User
          </DropdownMenuItem>
        )}

        {!isSelf && (
          <DropdownMenuItem className="text-red-600" onClick={deleteUser}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
