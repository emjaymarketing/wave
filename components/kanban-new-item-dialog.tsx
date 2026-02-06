"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KanbanColumn,
  KANBAN_COLUMNS,
} from "@/lib/types/kanban";

interface KanbanNewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetColumn: KanbanColumn;
  clients: Array<{ value: string; label: string; avatarUrl?: string | null }>;
  onSubmit: (item: {
    title: string;
    column: KanbanColumn;
    assigned_client_id?: string;
  }) => Promise<void>;
}

export function KanbanNewItemDialog({
  open,
  onOpenChange,
  targetColumn,
  clients,
  onSubmit,
}: KanbanNewItemDialogProps) {
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState<KanbanColumn>(targetColumn);
  const [clientId, setClientId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset when target column changes
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setColumn(targetColumn);
      setTitle("");
      setClientId("");
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        column,
        assigned_client_id: clientId || undefined,
      });
      handleOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Kanban Item</DialogTitle>
          <DialogDescription>
            Create a new item on the board. It will not be linked to a calendar event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Column</Label>
            <Select
              value={column}
              onValueChange={(val) => setColumn(val as KanbanColumn)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KANBAN_COLUMNS.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client (optional)</Label>
            <Combobox
              options={clients}
              value={clientId}
              onValueChange={setClientId}
              placeholder="Select client..."
              searchPlaceholder="Search clients..."
              emptyText="No clients found."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
