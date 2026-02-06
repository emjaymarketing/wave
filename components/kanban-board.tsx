"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { RefreshCw, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { KanbanNewItemDialog } from "./kanban-new-item-dialog";
import { EventFormDialog } from "./event-form-dialog";
import {
  KanbanItem,
  KanbanColumn as KanbanColumnType,
  KANBAN_COLUMNS,
} from "@/lib/types/kanban";
import { CalendarEvent, UserDetail } from "@/lib/types/calendar";

interface KanbanBoardProps {
  initialItems: KanbanItem[];
  clients: Array<{ value: string; label: string; avatarUrl?: string | null }>;
  isAdmin: boolean;
}

export function KanbanBoard({
  initialItems,
  clients,
  isAdmin,
}: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetColumn, setTargetColumn] =
    useState<KanbanColumnType>("Strategizing");
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Event dialog state
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    CalendarEvent | undefined
  >();
  const [admins, setAdmins] = useState<UserDetail[]>([]);
  const [eventClients, setEventClients] = useState<UserDetail[]>([]);
  const [eventDataLoaded, setEventDataLoaded] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const getColumnItems = useCallback(
    (column: KanbanColumnType) =>
      items
        .filter((item) => item.column === column)
        .filter((item) =>
          clientFilter === "all"
            ? true
            : clientFilter === "unassigned"
              ? !item.assigned_client_id
              : item.assigned_client_id === clientFilter,
        )
        .sort((a, b) => a.order_index - b.order_index),
    [items, clientFilter],
  );

  const findColumnForItem = useCallback(
    (id: UniqueIdentifier): KanbanColumnType | null => {
      const item = items.find((i) => i.id === id);
      if (item) return item.column;
      // Check if id is a column name (droppable)
      if (KANBAN_COLUMNS.includes(id as KanbanColumnType)) {
        return id as KanbanColumnType;
      }
      return null;
    },
    [items],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = items.find((i) => i.id === event.active.id);
      if (item) setActiveItem(item);
    },
    [items],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      const activeColumn = findColumnForItem(activeId);
      let overColumn = findColumnForItem(overId);

      // If hovering over a column directly (empty column)
      if (KANBAN_COLUMNS.includes(overId as KanbanColumnType)) {
        overColumn = overId as KanbanColumnType;
      }

      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === activeId ? { ...item, column: overColumn } : item,
        );
        return updated;
      });
    },
    [findColumnForItem],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id;

      // Determine the target column
      let targetCol: KanbanColumnType;
      if (KANBAN_COLUMNS.includes(overId as KanbanColumnType)) {
        targetCol = overId as KanbanColumnType;
      } else {
        const overItem = items.find((i) => i.id === overId);
        if (!overItem) return;
        targetCol = overItem.column;
      }

      const activeItem = items.find((i) => i.id === activeId);
      if (!activeItem) return;

      setItems((prev) => {
        // Move item to target column
        let updated = prev.map((item) =>
          item.id === activeId ? { ...item, column: targetCol } : item,
        );

        // Get items in the target column
        const columnItems = updated
          .filter((i) => i.column === targetCol)
          .sort((a, b) => a.order_index - b.order_index);

        // If dropping onto another item, reorder
        if (!KANBAN_COLUMNS.includes(overId as KanbanColumnType)) {
          const oldIndex = columnItems.findIndex((i) => i.id === activeId);
          const newIndex = columnItems.findIndex((i) => i.id === overId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const reordered = arrayMove(columnItems, oldIndex, newIndex);
            // Reassign order_index
            const orderMap = new Map<string, number>();
            reordered.forEach((item, idx) => orderMap.set(item.id, idx));
            updated = updated.map((item) =>
              orderMap.has(item.id)
                ? { ...item, order_index: orderMap.get(item.id)! }
                : item,
            );
          } else {
            // Just fix ordering
            const orderMap = new Map<string, number>();
            columnItems.forEach((item, idx) => orderMap.set(item.id, idx));
            updated = updated.map((item) =>
              orderMap.has(item.id)
                ? { ...item, order_index: orderMap.get(item.id)! }
                : item,
            );
          }
        } else {
          // Dropped on empty column area, append at end
          const columnItems2 = updated
            .filter((i) => i.column === targetCol)
            .sort((a, b) => a.order_index - b.order_index);
          const orderMap = new Map<string, number>();
          columnItems2.forEach((item, idx) => orderMap.set(item.id, idx));
          updated = updated.map((item) =>
            orderMap.has(item.id)
              ? { ...item, order_index: orderMap.get(item.id)! }
              : item,
          );
        }

        // Persist changes
        const affectedItems = updated
          .filter(
            (i) => i.column === targetCol || i.column === activeItem.column,
          )
          .map((i) => ({
            id: i.id,
            column: i.column,
            order_index: i.order_index,
          }));

        persistReorder(affectedItems);

        return updated;
      });
    },
    [items],
  );

  const persistReorder = async (
    affectedItems: Array<{ id: string; column: string; order_index: number }>,
  ) => {
    try {
      const res = await fetch("/api/kanban/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: affectedItems }),
      });
      if (!res.ok) {
        console.error("Failed to persist reorder");
        // Rollback: refetch
        refreshBoard();
      }
    } catch {
      console.error("Network error persisting reorder");
      refreshBoard();
    }
  };

  const refreshBoard = async () => {
    try {
      const res = await fetch("/api/kanban");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      console.error("Failed to refresh board");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/kanban/sync", { method: "POST" });
      if (res.ok) {
        const { synced } = await res.json();
        if (synced > 0) {
          await refreshBoard();
        }
      }
    } catch {
      console.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleAddItem = (column: KanbanColumnType) => {
    setTargetColumn(column);
    setDialogOpen(true);
  };

  // Fetch admins + clients for EventFormDialog (lazy, once)
  const ensureEventFormData = async () => {
    if (eventDataLoaded) return;
    try {
      const [adminsRes, clientsRes] = await Promise.all([
        fetch("/api/admins"),
        fetch("/api/clients"),
      ]);
      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setEventClients(Array.isArray(data) ? data : data.clients || []);
      }
      setEventDataLoaded(true);
    } catch {
      console.error("Failed to fetch form data");
    }
  };

  const handleCardClick = async (item: KanbanItem) => {
    if (!item.calendar_event_id) return;
    try {
      await ensureEventFormData();
      const res = await fetch(
        `/api/calendar-events?id=${item.calendar_event_id}`,
      );
      if (!res.ok) return;
      const events = await res.json();
      const event = Array.isArray(events)
        ? events.find((e: CalendarEvent) => e.id === item.calendar_event_id)
        : events;
      if (event) {
        setSelectedEvent(event);
        setEventDialogOpen(true);
      }
    } catch {
      console.error("Failed to fetch calendar event");
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        setEventDialogOpen(false);
        setSelectedEvent(undefined);
        await refreshBoard();
      }
    } catch {
      console.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this calendar event? The board card will be kept but unlinked.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/calendar-events/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEventDialogOpen(false);
        setSelectedEvent(undefined);
        await refreshBoard();
      }
    } catch {
      console.error("Failed to delete event");
    }
  };

  const handleDeleteItem = async (id: string) => {
    const previous = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch(`/api/kanban?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(previous);
      }
    } catch {
      setItems(previous);
    }
  };

  const handleItemCreated = async (newItem: {
    title: string;
    column: KanbanColumnType;
    assigned_client_id?: string;
  }) => {
    try {
      const res = await fetch("/api/kanban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        await refreshBoard();
      }
    } catch {
      console.error("Failed to create item");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Board</h1>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[200px] h-9">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.value} value={client.value}>
                  {client.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Calendar"}
            </Button>
            <Button size="sm" onClick={() => handleAddItem("Strategizing")}>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-h-full">
            {KANBAN_COLUMNS.map((column, index) => (
              <KanbanColumn
                key={column}
                column={column}
                columnIndex={index}
                items={getColumnItems(column)}
                onAddItem={handleAddItem}
                onDeleteItem={isAdmin ? handleDeleteItem : () => {}}
                onCardClick={isAdmin ? handleCardClick : undefined}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="rotate-2 opacity-90">
                <KanbanCard
                  item={activeItem}
                  columnIndex={KANBAN_COLUMNS.indexOf(activeItem.column)}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <KanbanNewItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetColumn={targetColumn}
        clients={clients}
        onSubmit={handleItemCreated}
      />

      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) setSelectedEvent(undefined);
        }}
        onSubmit={handleUpdateEvent}
        event={selectedEvent}
        admins={admins}
        clients={eventClients}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
