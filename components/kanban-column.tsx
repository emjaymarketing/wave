"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KanbanItem,
  KanbanColumn as KanbanColumnType,
} from "@/lib/types/kanban";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: KanbanColumnType;
  columnIndex: number;
  items: KanbanItem[];
  onAddItem: (column: KanbanColumnType) => void;
  onDeleteItem: (id: string) => void;
  onCardClick?: (item: KanbanItem) => void;
}

export function KanbanColumn({
  column,
  columnIndex,
  items,
  onAddItem,
  onDeleteItem,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] shrink-0 border-r border-border last:border-r-0">
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {column}
          </h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
            {items.length}
          </span>
        </div>
        <button
          onClick={() => onAddItem(column)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 p-1 rounded-lg min-h-[200px] transition-colors",
          isOver && "bg-accent/50 ring-1 ring-primary/10",
        )}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              columnIndex={columnIndex}
              onDelete={onDeleteItem}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
