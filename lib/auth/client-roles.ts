"use client";

import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types/roles";

export async function getUserRoleClient(): Promise<UserRole | null> {
  const supabase = createClient();
  
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
