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

  // Query user_roles and try to get user emails from auth schema
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select(
      `
      user_id,
      created_at
    `,
    )
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  if (!userRoles || userRoles.length === 0) {
    return NextResponse.json([]);
  }

  // Use the database function to get user details including names and avatars
  const userIds = userRoles.map((ur) => ur.user_id);
  const { data: userDetails, error: detailsError } = await supabase.rpc(
    "get_user_details",
    { user_ids: userIds },
  );

  let userMap: Record<string, any> = {};

  if (!detailsError && userDetails) {
    userDetails.forEach((user: any) => {
      userMap[user.id] = user;
    });
  }

  const clients = userRoles.map((ur) => {
    const userDetail = userMap[ur.user_id];
    return {
      id: ur.user_id,
      email:
        userDetail?.email ||
        (ur.user_id === currentUser.id
          ? currentUser.email
          : `Client ${ur.user_id.slice(0, 8)}`),
      full_name: userDetail?.full_name || "Unknown User",
      avatar_url: userDetail?.avatar_url || null,
    };
  });

  return NextResponse.json(clients);
}
