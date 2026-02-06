import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/kanban-board";

export default async function KanbanPage() {
  const role = await getUserRole();
  if (!role) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch kanban items
  let query = supabase
    .from("kanban_items")
    .select("*")
    .order("column")
    .order("order_index", { ascending: true });

  if (role === "client") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      query = query.eq("assigned_client_id", user.id);
    }
  }

  const { data: items } = await query;

  // Batch-fetch user details for items
  const allUserIds = new Set<string>();
  (items || []).forEach((item) => {
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

  const itemsWithDetails = (items || []).map((item) => ({
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

  // Fetch clients for the combobox (admin only)
  let clientOptions: Array<{
    value: string;
    label: string;
    avatarUrl?: string | null;
  }> = [];

  if (role === "admin") {
    const adminSupabase = createAdminClient();
    const { data: userRoles } = await adminSupabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "client");

    if (userRoles && userRoles.length > 0) {
      const clientIds = userRoles.map((ur) => ur.user_id);
      const { data: clientDetails } = await adminSupabase.rpc(
        "get_user_details",
        { user_ids: clientIds }
      );
      if (clientDetails) {
        clientOptions = clientDetails.map((c: any) => ({
          value: c.id,
          label: c.full_name || c.email,
          avatarUrl: c.avatar_url || null,
        }));
      }
    }
  }

  return (
    <KanbanBoard
      initialItems={itemsWithDetails}
      clients={clientOptions}
      isAdmin={role === "admin"}
    />
  );
}
