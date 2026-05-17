import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  authCookieNames,
  getAuthenticatedSupabaseServerClient,
  getSupabaseAdminClient,
} from "@/src/lib/supabase-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;

  if (!token) {
    redirect("/account/login");
  }

  const supabase = getAuthenticatedSupabaseServerClient(token);
  
  if (!supabase) {
    redirect("/account/login");
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    redirect("/account/login");
  }

  const roleSupabase = getSupabaseAdminClient() ?? supabase;

  const { data: userData } = await roleSupabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/account/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
