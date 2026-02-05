import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/roles";

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.ADMIN;
}

export async function isClient(): Promise<boolean> {
  const role = await getUserRole();
  return role === UserRole.CLIENT;
}

export async function requireRole(requiredRole: UserRole): Promise<boolean> {
  const role = await getUserRole();
  return role === requiredRole;
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role, updated_at: new Date().toISOString() });
}
