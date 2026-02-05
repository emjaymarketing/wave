import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { UserRole } from "@/lib/types/roles";
import { Suspense } from "react";

async function AdminsList() {
  const supabase = await createClient();

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (!userRoles || userRoles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No admins found.</p>
      </div>
    );
  }

  const userIds = userRoles.map((ur) => ur.user_id);
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const adminsWithDetails = userRoles.map((ur) => {
    const user = users?.find((u) => u.id === ur.user_id);
    return {
      ...ur,
      email: user?.email || "Unknown",
      last_sign_in: user?.last_sign_in_at,
    };
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-4 font-medium">Email</th>
            <th className="text-left p-4 font-medium">Joined</th>
            <th className="text-left p-4 font-medium">Last Sign In</th>
          </tr>
        </thead>
        <tbody>
          {adminsWithDetails.map((admin) => (
            <tr key={admin.user_id} className="border-t hover:bg-muted/50">
              <td className="p-4 font-medium">{admin.email}</td>
              <td className="p-4 text-sm text-muted-foreground">
                {new Date(admin.created_at).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {admin.last_sign_in
                  ? new Date(admin.last_sign_in).toLocaleDateString()
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function AdminStats() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  const totalAdmins = admins?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Admins
        </h3>
        <p className="text-3xl font-bold mt-2">{totalAdmins}</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Active Today
        </h3>
        <p className="text-3xl font-bold mt-2">-</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Pending Invites
        </h3>
        <p className="text-3xl font-bold mt-2">-</p>
      </div>
    </div>
  );
}

export default function AdminsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Admins</h1>
        <p className="text-muted-foreground mt-2">
          Manage administrator accounts and permissions
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <AdminStats />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Administrators</h2>
        <Suspense fallback={<div>Loading admins...</div>}>
          <AdminsList />
        </Suspense>
      </div>
    </div>
  );
}
