import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { UserRole } from "@/lib/types/roles";
import { Suspense } from "react";

async function ClientsList() {
  const supabase = await createClient();

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (!userRoles || userRoles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No clients found.</p>
      </div>
    );
  }

  const userIds = userRoles.map((ur) => ur.user_id);
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();

  const clientsWithDetails = userRoles.map((ur) => {
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
          {clientsWithDetails.map((client) => (
            <tr key={client.user_id} className="border-t hover:bg-muted/50">
              <td className="p-4">{client.email}</td>
              <td className="p-4 text-sm text-muted-foreground">
                {new Date(client.created_at).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {client.last_sign_in
                  ? new Date(client.last_sign_in).toLocaleDateString()
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function ClientStats() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "client");

  const totalClients = clients?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Total Clients
        </h3>
        <p className="text-3xl font-bold mt-2">{totalClients}</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          Active This Month
        </h3>
        <p className="text-3xl font-bold mt-2">-</p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          New This Week
        </h3>
        <p className="text-3xl font-bold mt-2">-</p>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all client accounts
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <ClientStats />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Clients</h2>
        <Suspense fallback={<div>Loading clients...</div>}>
          <ClientsList />
        </Suspense>
      </div>
    </div>
  );
}
