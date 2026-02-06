import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  async function getRedirectPath() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "/";
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    return roleData?.role === "admin" ? "/admin" : "/client";
  }

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(await getRedirectPath());
    }

    // PKCE failed (likely opened in different browser context where code
    // verifier cookie is missing). Fall back to admin verification: use the
    // code as a token_hash with the admin client to confirm the user's email,
    // then redirect to login so they can sign in normally.
    const adminClient = createAdminClient();
    const { error: verifyError } = await adminClient.auth.verifyOtp({
      token_hash: code,
      type: "email",
    });

    if (!verifyError) {
      redirect("/auth/login?message=Email confirmed. Please sign in.");
    }

    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  // Handle OTP flow (token_hash + type parameters)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(await getRedirectPath());
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/error?error=No token hash or type`);
}
