import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function GET() {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  if (!userRoles || userRoles.length === 0) {
    return NextResponse.json([]);
  }

  const admins = userRoles.map((ur) => ({
    id: ur.user_id,
    email:
      ur.user_id === currentUser.id
        ? currentUser.email
        : `Admin ${ur.user_id.slice(0, 8)}`,
  }));

  return NextResponse.json(admins);
}
