"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json() as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Authentication failed.");
      return;
    }

    router.replace("/products");
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email address</label>
        <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-full bg-white px-5 text-[#24102f]" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-full bg-white px-5 text-[#24102f]" />
      </div>
      {message && <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-violet-50">{message}</p>}
      <Button className="h-12 rounded-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : mode === "login" ? <LockKeyhole /> : <UserPlus />}
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
