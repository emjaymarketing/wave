import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET() {
  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  if (!userRoles || userRoles.length === 0) {
    return NextResponse.json({
      clients: [],
      stats: { totalClients: 0, avgMembershipDays: 0, activeThisMonth: 0 },
    });
  }

  const userIds = userRoles.map((ur) => ur.user_id);
  const { data: userDetails } = await supabase.rpc("get_user_details", {
    user_ids: userIds,
  });

  const roleMap: Record<string, string> = {};
  userRoles.forEach((ur) => {
    roleMap[ur.user_id] = ur.created_at;
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const clients = (userDetails || []).map((user: any) => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    client_since: roleMap[user.id] || user.created_at,
    last_sign_in_at: user.last_sign_in_at,
  }));

  const totalClients = clients.length;

  const totalDays = clients.reduce((sum: number, c: any) => {
    const since = new Date(c.client_since);
    const days = Math.floor(
      (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24),
    );
    return sum + days;
  }, 0);
  const avgMembershipDays =
    totalClients > 0 ? Math.round(totalDays / totalClients) : 0;

  const activeThisMonth = clients.filter((c: any) => {
    if (!c.last_sign_in_at) return false;
    return new Date(c.last_sign_in_at) >= startOfMonth;
  }).length;

  return NextResponse.json({
    clients,
    stats: { totalClients, avgMembershipDays, activeThisMonth },
  });
}
