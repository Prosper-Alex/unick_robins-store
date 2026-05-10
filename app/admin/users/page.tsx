import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/src/lib/supabase-server";
import { UsersTable, type UserRow } from "@/components/admin/users-table";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/account/login");
  }

  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      role,
      created_at,
      orders (id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  const formattedUsers: UserRow[] = (users || []).map((user: any) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    orderCount: Array.isArray(user.orders) ? user.orders.length : 0,
  }));

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#9a7734]">
          Directory
        </p>
        <h1 className="mt-2 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">
          User management
        </h1>
      </div>
      <UsersTable users={formattedUsers} />
    </div>
  );
}
