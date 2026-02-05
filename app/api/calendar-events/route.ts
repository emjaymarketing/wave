import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET(request: Request) {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  let query = supabase
    .from("calendar_events")
    .select("*")
    .order("due_date", { ascending: true });

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    query = query
      .gte("due_date", startDate.toISOString())
      .lte("due_date", endDate.toISOString());
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const eventsWithDetails = data.map((event) => ({
    ...event,
    assignee: event.assignee_id
      ? {
          id: event.assignee_id,
          email:
            event.assignee_id === currentUser?.id && currentUser?.email
              ? currentUser.email
              : `Admin ${event.assignee_id.slice(0, 8)}`,
        }
      : undefined,
    overdue_toggle:
      event.due_date < new Date().toISOString() && event.status !== "Completed",
    overdue_days: calculateOverdueDays(event.due_date, event.status),
  }));

  return NextResponse.json(eventsWithDetails);
}

export async function POST(request: Request) {
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

  const body = await request.json();

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      task_name: body.task_name,
      requester_source: body.requester_source,
      due_date: body.due_date,
      status: body.status || "To Do",
      priority: body.priority || "P3",
      assignee_id: body.assignee_id || null,
      linked_objective: body.linked_objective || null,
      estimated_time: body.estimated_time || null,
      description: body.description || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

function calculateOverdueDays(dueDate: string, status: string): number {
  if (status === "Completed") {
    return 0;
  }

  const due = new Date(dueDate);
  const now = new Date();

  if (due < now) {
    const diffTime = Math.abs(now.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return 0;
}
