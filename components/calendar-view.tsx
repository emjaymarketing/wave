"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/lib/types/calendar";

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarView({
  events,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.due_date), day));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "bg-red-500 hover:bg-red-600";
      case "P2":
        return "bg-orange-500 hover:bg-orange-600";
      case "P3":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "P4":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "border-green-500";
      case "In Progress":
        return "border-blue-500";
      case "Blocked":
        return "border-red-500";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-muted p-2 text-center text-sm font-semibold"
          >
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={idx}
              className={cn(
                "bg-background min-h-[120px] p-2 cursor-pointer hover:bg-accent/50 transition-colors",
                !isCurrentMonth && "opacity-40",
              )}
              onClick={() => onDateClick(day)}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday &&
                    "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={cn(
                      "text-xs p-1 rounded cursor-pointer truncate border-l-2",
                      getPriorityColor(event.priority),
                      getStatusColor(event.status),
                      "text-white",
                    )}
                    title={event.task_name}
                  >
                    {event.task_name}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Priority:</span>
          <Badge className="bg-red-500">P1</Badge>
          <Badge className="bg-orange-500">P2</Badge>
          <Badge className="bg-yellow-500">P3</Badge>
          <Badge className="bg-blue-500">P4</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
