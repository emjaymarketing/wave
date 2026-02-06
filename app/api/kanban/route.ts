import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET() {
  const supabase = await createClient();

  const role = await getUserRole();
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("kanban_items")
    .select("*")
    .order("column")
    .order("order_index", { ascending: true });

  // Clients only see their own items
  if (role === "client") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    query = query.eq("assigned_client_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Batch-fetch user details
  const allUserIds = new Set<string>();
  data.forEach((item) => {
    if (item.assignee_id) allUserIds.add(item.assignee_id);
    if (item.assigned_client_id) allUserIds.add(item.assigned_client_id);
  });

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

  const itemsWithDetails = data.map((item) => ({
    ...item,
    assignee:
      item.assignee_id && userMap[item.assignee_id]
        ? userMap[item.assignee_id]
        : undefined,
    assigned_client:
      item.assigned_client_id && userMap[item.assigned_client_id]
        ? userMap[item.assigned_client_id]
        : undefined,
  }));

  return NextResponse.json(itemsWithDetails);
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

  // Get max order_index for the target column
  const { data: maxItem } = await supabase
    .from("kanban_items")
    .select("order_index")
    .eq("column", body.column || "Strategizing")
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxItem?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("kanban_items")
    .insert({
      title: body.title,
      calendar_event_id: body.calendar_event_id || null,
      assigned_client_id: body.assigned_client_id || null,
      assignee_id: body.assignee_id || null,
      column: body.column || "Strategizing",
      order_index: nextOrder,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing item id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kanban_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing item id" }, { status: 400 });
  }

  const { error } = await supabase.from("kanban_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
