"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function DashboardButton() {
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardUrl() {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDashboardUrl(null);
        setLoading(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const url = roleData?.role === "admin" ? "/admin" : "/client";
      setDashboardUrl(url);
      setLoading(false);
    }

    getDashboardUrl();
  }, []);

  if (loading || !dashboardUrl) return null;

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={dashboardUrl}>
        <LayoutDashboard className="h-4 w-4 mr-2" />
        Dashboard
      </Link>
    </Button>
  );
}
