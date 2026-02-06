"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: any) => void;
  event?: any;
  selectedDate?: Date;
  admins: Array<{
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  }>;
  clients: Array<{
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  }>;
}

export function EventFormDialog({
  open,
  onOpenChange,
  onSubmit,
  event,
  selectedDate,
  admins,
  clients,
}: EventFormDialogProps) {
  const [formData, setFormData] = useState({
    task_name: "",
    assigned_client_id: "",
    due_date: "",
    due_time: "",
    status: "To Do",
    priority: "P3",
    assignee_id: "",
    linked_objective: "",
    estimated_time: "",
    description: "",
  });

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.due_date);
      setFormData({
        task_name: event.task_name || "",
        assigned_client_id: event.assigned_client_id || "",
        due_date: eventDate.toISOString().slice(0, 10),
        due_time: eventDate.toTimeString().slice(0, 5),
        status: event.status || "To Do",
        priority: event.priority || "P3",
        assignee_id: event.assignee_id || "",
        linked_objective: event.linked_objective || "",
        estimated_time: event.estimated_time?.toString() || "",
        description: event.description || "",
      });
    } else if (selectedDate) {
      setFormData({
        task_name: "",
        assigned_client_id: "",
        due_date: selectedDate.toISOString().slice(0, 10),
        due_time: "09:00",
        status: "To Do",
        priority: "P3",
        assignee_id: "",
        linked_objective: "",
        estimated_time: "",
        description: "",
      });
    } else {
      setFormData({
        task_name: "",
        assigned_client_id: "",
        due_date: "",
        due_time: "09:00",
        status: "To Do",
        priority: "P3",
        assignee_id: "",
        linked_objective: "",
        estimated_time: "",
        description: "",
      });
    }
  }, [event, selectedDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDateTimeString = `${formData.due_date}T${formData.due_time}:00`;
    const submitData = {
      task_name: formData.task_name,
      assigned_client_id: formData.assigned_client_id || null,
      due_date: new Date(dueDateTimeString).toISOString(),
      status: formData.status,
      priority: formData.priority,
      estimated_time: formData.estimated_time
        ? parseInt(formData.estimated_time)
        : null,
      assignee_id: formData.assignee_id || null,
      linked_objective: formData.linked_objective || null,
      description: formData.description || null,
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task_name">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task_name"
                value={formData.task_name}
                onChange={(e) =>
                  setFormData({ ...formData, task_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_client_id">
                Assigned Client <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.full_name,
                }))}
                value={formData.assigned_client_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigned_client_id: value })
                }
                placeholder="Select a client..."
                searchPlaceholder="Search clients..."
                emptyText="No clients found."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_time">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="due_time"
                type="time"
                value={formData.due_time}
                onChange={(e) =>
                  setFormData({ ...formData, due_time: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
              <Input
                id="estimated_time"
                type="number"
                min="0"
                value={formData.estimated_time}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 (Highest)</SelectItem>
                  <SelectItem value="P2">P2 (High)</SelectItem>
                  <SelectItem value="P3">P3 (Medium)</SelectItem>
                  <SelectItem value="P4">P4 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee_id">Assignee</Label>
              <Select
                value={formData.assignee_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignee_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linked_objective">Linked Objective</Label>
            <Input
              id="linked_objective"
              value={formData.linked_objective}
              onChange={(e) =>
                setFormData({ ...formData, linked_objective: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{event ? "Update" : "Create"} Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
