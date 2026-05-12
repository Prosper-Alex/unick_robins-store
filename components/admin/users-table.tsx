"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface UserRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
  orderCount: number;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-100/50" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-white/[0.08] pl-9 text-white placeholder:text-violet-100/45 focus-visible:ring-[#d6b25e]/40"
          />
        </div>
      </div>
      
      <div className="grid gap-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-8 text-center text-violet-100/55">
            No users found.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="rounded-xl border border-white/10 bg-white/[0.08] p-4 text-white shadow-xl shadow-black/20 backdrop-blur">
              <p className="break-all font-medium">{user.email}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <RoleSelect user={user} />
                <span className="rounded-full bg-[#24102f] px-3 py-1 font-mono text-xs text-violet-100/75">
                  {user.orderCount} orders
                </span>
              </div>
              <p className="mt-3 text-xs text-violet-100/60">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-white/10 bg-white/[0.08] text-white shadow-xl shadow-black/20 backdrop-blur md:block">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-white/10 bg-white/[0.04] hover:bg-white/[0.04]">
              <TableHead className="font-semibold text-violet-100/70">Email</TableHead>
              <TableHead className="font-semibold text-violet-100/70">Role</TableHead>
              <TableHead className="font-semibold text-violet-100/70">Joined</TableHead>
              <TableHead className="text-right font-semibold text-violet-100/70">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={4} className="h-24 text-center text-violet-100/55">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/[0.04]">
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <RoleSelect user={user} />
                  </TableCell>
                  <TableCell className="text-violet-100/60">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {user.orderCount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { updateUserRoleAction } from "@/src/actions/admin-users";
import { Loader2 } from "lucide-react";

function RoleSelect({ user }: { user: UserRow }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(user.role);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as "admin" | "customer";
    setLoading(true);
    try {
      await updateUserRoleAction(user.id, newRole);
      setRole(newRole);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
      // Revert select on error
      e.target.value = role;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={role}
        onChange={handleChange}
        disabled={loading}
        className={`appearance-none rounded-full px-3 py-1 pr-8 text-xs font-medium capitalize outline-none transition-colors focus:ring-2 focus:ring-violet-500 disabled:opacity-50 ${
          role === "admin"
            ? "bg-[#d6b25e] text-[#24102f]"
            : "bg-white/[0.08] text-violet-100 ring-1 ring-white/10"
        }`}
      >
        <option value="customer">Customer</option>
        <option value="admin">Admin</option>
      </select>
      {loading && <Loader2 className="absolute right-2 size-3 animate-spin text-stone-400" />}
    </div>
  );
}
