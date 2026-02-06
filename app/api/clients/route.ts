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
    .select("user_id")
    .eq("role", "client");

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  if (!userRoles || userRoles.length === 0) {
    return NextResponse.json([]);
  }

  const userIds = userRoles.map((ur) => ur.user_id);
  const { data: userDetails } = await supabase.rpc("get_user_details", {
    user_ids: userIds,
  });

  const clients = (userDetails || []).map((user: any) => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
  }));

  return NextResponse.json(clients);
}
