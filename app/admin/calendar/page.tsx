"use client";

import { useState, useEffect } from "react";
import { CalendarView } from "@/components/calendar-view";
import { EventList } from "@/components/event-list";
import { EventFormDialog } from "@/components/event-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarEvent, UserDetail } from "@/lib/types/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [admins, setAdmins] = useState<UserDetail[]>([]);
  const [clients, setClients] = useState<UserDetail[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    CalendarEvent | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchAdmins();
    fetchClients();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/calendar-events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data) ? data : data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents();
        setIsDialogOpen(false);
        setSelectedEvent(undefined);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/calendar-events/${selectedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents();
        setIsDialogOpen(false);
        setSelectedEvent(undefined);
      }
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/calendar-events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedEvent(undefined);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const filteredEvents =
    statusFilter === "all"
      ? events
      : events.filter((e) => e.status === statusFilter);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Manage tasks and events for the admin team
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedEvent(undefined);
            setSelectedDate(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filter by status:
          </span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading calendar...
        </div>
      ) : (
        <>
          {viewMode === "calendar" ? (
            <CalendarView
              events={filteredEvents}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          ) : (
            <EventList
              events={filteredEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          )}
        </>
      )}

      <EventFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedDate(undefined);
          }
        }}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
        admins={admins}
        clients={clients}
      />
    </div>
  );
}
