import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authCookieNames, getAuthenticatedSupabaseServerClient } from "@/src/lib/supabase-server";
import { UsersTable, type UserRow } from "@/components/admin/users-table";

export const dynamic = 'force-dynamic';

type UserWithOrders = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  orders: Array<{ id: string }> | null;
};

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieNames.access)?.value;
  const supabase = token ? getAuthenticatedSupabaseServerClient(token) : null;

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

  const formattedUsers: UserRow[] = ((users ?? []) as UserWithOrders[]).map((user) => ({
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
