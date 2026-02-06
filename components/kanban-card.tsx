"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanItem } from "@/lib/types/kanban";

const COLUMN_COLORS = [
  "bg-violet-50 dark:bg-violet-950/30",
  "bg-blue-50 dark:bg-blue-950/30",
  "bg-cyan-50 dark:bg-cyan-950/30",
  "bg-teal-50 dark:bg-teal-950/30",
  "bg-emerald-50 dark:bg-emerald-950/30",
  "bg-amber-50 dark:bg-amber-950/30",
  "bg-orange-50 dark:bg-orange-950/30",
  "bg-rose-50 dark:bg-rose-950/30",
  "bg-pink-50 dark:bg-pink-950/30",
  "bg-green-50 dark:bg-green-950/30",
];

interface KanbanCardProps {
  item: KanbanItem;
  columnIndex: number;
  onDelete?: (id: string) => void;
  onCardClick?: (item: KanbanItem) => void;
}

export function KanbanCard({
  item,
  columnIndex,
  onDelete,
  onCardClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-default",
        COLUMN_COLORS[columnIndex % COLUMN_COLORS.length],
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div
          className={cn(
            "flex-1 min-w-0",
            item.calendar_event_id && onCardClick && "cursor-pointer",
          )}
          onClick={(e) => {
            if (item.calendar_event_id && onCardClick) {
              e.stopPropagation();
              onCardClick(item);
            }
          }}
        >
          <p className="text-sm font-medium leading-snug break-words">
            {item.title}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {item.assigned_client && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[100px]">
                  {item.assigned_client.full_name || item.assigned_client.email}
                </span>
              </div>
            )}
            {item.calendar_event_id && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs text-blue-500",
                  onCardClick && "hover:text-blue-700 hover:underline",
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>View Event</span>
              </div>
            )}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
