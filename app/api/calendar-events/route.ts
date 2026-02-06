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
  const id = searchParams.get("id");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  let query = supabase
    .from("calendar_events")
    .select("*")
    .order("due_date", { ascending: true });

  if (id) {
    query = query.eq("id", id);
  }

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

  // Collect all user IDs referenced in events
  const allUserIds = new Set<string>();
  data.forEach((event) => {
    if (event.assignee_id) allUserIds.add(event.assignee_id);
    if (event.assigned_client_id) allUserIds.add(event.assigned_client_id);
  });

  // Fetch user details in one batch
  const userMap: Record<string, any> = {};
  if (allUserIds.size > 0) {
    const { data: userDetails } = await supabase.rpc("get_user_details", {
      user_ids: Array.from(allUserIds),
    });
    if (userDetails) {
      userDetails.forEach((u: any) => {
        userMap[u.id] = u;
      });
    }
  }

  const eventsWithDetails = data.map((event) => ({
    ...event,
    assignee:
      event.assignee_id && userMap[event.assignee_id]
        ? userMap[event.assignee_id]
        : undefined,
    assigned_client:
      event.assigned_client_id && userMap[event.assigned_client_id]
        ? userMap[event.assigned_client_id]
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
      assigned_client_id: body.assigned_client_id || null,
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
