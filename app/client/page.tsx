import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { UserRole } from "@/lib/types/roles";
import { Suspense } from "react";

async function ClientWelcome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <p className="text-muted-foreground mt-2">Welcome back, {user?.email}</p>
  );
}

async function ClientInfo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role, created_at")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Account Information
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Account Type</p>
          <p className="font-medium capitalize">{roleData?.role}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Member Since</p>
          <p className="font-medium">
            {roleData?.created_at
              ? new Date(roleData.created_at).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

async function ClientDashboardContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2">Recent Activity</h3>
        <p className="text-muted-foreground text-sm">
          No recent activity to display.
        </p>
      </div>
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
        <p className="text-muted-foreground text-sm">
          Your quick actions will appear here.
        </p>
      </div>
    </div>
  );
}

export default function ClientPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <Suspense
          fallback={<p className="text-muted-foreground mt-2">Loading...</p>}
        >
          <ClientWelcome />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading account info...</div>}>
        <ClientInfo />
      </Suspense>

      <div>
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <ClientDashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
