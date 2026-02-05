import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { UserRole } from "@/lib/types/roles";
import { Suspense } from "react";

async function WelcomeMessage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <p className="text-muted-foreground mt-2">Welcome back, {user?.email}</p>
  );
}

async function AdminStats() {
  const supabase = await createClient();

  const { data: users } = await supabase.from("user_roles").select("role");

  const totalUsers = users?.length || 0;
  const adminCount = users?.filter((u) => u.role === "admin").length || 0;
  const clientCount = users?.filter((u) => u.role === "client").length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Users
        </h3>
        <p className="text-3xl font-bold mt-2">{totalUsers}</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Admins</h3>
        <p className="text-3xl font-bold mt-2">{adminCount}</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Clients</h3>
        <p className="text-3xl font-bold mt-2">{clientCount}</p>
      </div>
    </div>
  );
}

async function UserList() {
  const supabase = await createClient();

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: false });

  if (!userRoles || userRoles.length === 0) {
    return <p className="text-muted-foreground">No users found.</p>;
  }

  const userIds = userRoles.map((ur) => ur.user_id);
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const usersWithRoles = userRoles.map((ur) => {
    const user = users?.find((u) => u.id === ur.user_id);
    return {
      ...ur,
      email: user?.email || "Unknown",
    };
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-4 font-medium">Email</th>
            <th className="text-left p-4 font-medium">Role</th>
            <th className="text-left p-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {usersWithRoles.map((user) => (
            <tr key={user.user_id} className="border-t">
              <td className="p-4">{user.email}</td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Suspense
          fallback={<p className="text-muted-foreground mt-2">Loading...</p>}
        >
          <WelcomeMessage />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <AdminStats />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Users</h2>
        <Suspense fallback={<div>Loading users...</div>}>
          <UserList />
        </Suspense>
      </div>
    </div>
  );
}
