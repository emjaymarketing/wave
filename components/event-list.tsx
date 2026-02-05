"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  task_name: string;
  requester_source: string;
  due_date: string;
  status: string;
  priority: string;
  assignee_id?: string;
  assignee?: { id: string; email: string };
  linked_objective?: string;
  estimated_time?: number;
  description?: string;
  overdue_toggle: boolean;
  overdue_days?: number;
}

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "bg-red-500";
      case "P2":
        return "bg-orange-500";
      case "P3":
        return "bg-yellow-500";
      case "P4":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No events found. Click "Add Event" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{event.task_name}</h3>
                    {event.overdue_toggle && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Overdue {event.overdue_days}d
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Requested by: {event.requester_source}</span>
                    {event.assignee && (
                      <>
                        <span>•</span>
                        <span>Assigned to: {event.assignee.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Due:{" "}
                    {format(new Date(event.due_date), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                {event.estimated_time && (
                  <>
                    <span>•</span>
                    <span>Est. {event.estimated_time} min</span>
                  </>
                )}
                {event.linked_objective && (
                  <>
                    <span>•</span>
                    <span>Objective: {event.linked_objective}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={cn("text-white", getPriorityColor(event.priority))}
                >
                  {event.priority}
                </Badge>
                <Badge
                  className={cn("text-white", getStatusColor(event.status))}
                >
                  {event.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(event)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
