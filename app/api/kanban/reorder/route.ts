import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/roles";

export async function POST(request: Request) {
  const supabase = await createClient();

  const role = await getUserRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { items } = body as {
    items: Array<{ id: string; column: string; order_index: number }>;
  };

  if (!items || !Array.isArray(items)) {
    return NextResponse.json(
      { error: "Missing items array" },
      { status: 400 }
    );
  }

  // Batch update all items
  const updates = items.map((item) =>
    supabase
      .from("kanban_items")
      .update({ column: item.column, order_index: item.order_index })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Some updates failed", details: errors.map((e) => e.error) },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
