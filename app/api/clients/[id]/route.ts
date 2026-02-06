import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Verify this user is a client
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at")
    .eq("user_id", id)
    .eq("role", "client")
    .single();

  if (roleError || !userRole) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: userDetails } = await supabase.rpc("get_user_details", {
    user_ids: [id],
  });

  if (!userDetails || userDetails.length === 0) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const user = userDetails[0];

  // Get calendar events assigned to this client
  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, task_name, due_date, status, priority")
    .eq("assigned_client_id", id)
    .order("due_date", { ascending: false })
    .limit(10);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    client_since: userRole.created_at,
    last_sign_in_at: user.last_sign_in_at,
    recent_events: events || [],
  });
}
