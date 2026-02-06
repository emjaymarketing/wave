import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createAdminClient();

  const formData = await request.formData();
  const userId = formData.get("user_id") as string;
  const avatar = formData.get("avatar") as File | null;

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  let avatarUrl: string | null = null;

  // Upload avatar to storage
  if (avatar && avatar.size > 0) {
    const fileExt = avatar.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    const arrayBuffer = await avatar.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        upsert: true,
        contentType: avatar.type,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
    } else {
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      avatarUrl = urlData.publicUrl;
    }
  }

  // Update the user profile with the avatar URL
  if (avatarUrl) {
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}
