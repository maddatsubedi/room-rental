"use client";

import Link from "next/link";
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
import { MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react";

interface AdminRoomActionsProps {
  roomId: string;
}

export function AdminRoomActions({ roomId }: AdminRoomActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this room? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete room");
      }

      toast.success("Room deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/rooms/${roomId}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/landlord/rooms/${roomId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Room
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Room
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
