import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function POST() {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch all calendar events
  const { data: calendarEvents, error: calError } = await supabase
    .from("calendar_events")
    .select("id, task_name, assigned_client_id, assignee_id");

  if (calError) {
    return NextResponse.json({ error: calError.message }, { status: 500 });
  }

  // Fetch all existing kanban items that are linked to calendar events
  const { data: existingItems, error: kanbanError } = await supabase
    .from("kanban_items")
    .select("calendar_event_id")
    .not("calendar_event_id", "is", null);

  if (kanbanError) {
    return NextResponse.json({ error: kanbanError.message }, { status: 500 });
  }

  const linkedEventIds = new Set(
    existingItems.map((item) => item.calendar_event_id)
  );

  // Find calendar events that don't have a kanban item yet
  const unlinkedEvents = calendarEvents.filter(
    (event) => !linkedEventIds.has(event.id)
  );

  if (unlinkedEvents.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  // Get the current max order_index in Strategizing column
  const { data: maxItem } = await supabase
    .from("kanban_items")
    .select("order_index")
    .eq("column", "Strategizing")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  let nextOrder = (maxItem?.order_index ?? -1) + 1;

  // Create kanban items for all unlinked events
  const newItems = unlinkedEvents.map((event) => ({
    calendar_event_id: event.id,
    title: event.task_name,
    assigned_client_id: event.assigned_client_id || null,
    assignee_id: event.assignee_id || null,
    column: "Strategizing",
    order_index: nextOrder++,
    created_by: user.id,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("kanban_items")
    .insert(newItems)
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ synced: inserted.length });
}
