"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json() as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "Unable to sign in.");
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="grid min-h-screen bg-stone-950 p-4 text-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-stone-900 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=85"
          alt="Luxury beauty admin"
          fill
          sizes="50vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b25e]">Admin suite</p>
          <h1 className="mt-3 max-w-xl text-4xl font-normal leading-[1.1] tracking-tight">
            Manage the luxury experience from inventory to insight.
          </h1>
        </div>
      </section>
      <section className="flex items-center justify-center">
        <Card className="w-full max-w-md border-white/10 bg-white p-6 text-stone-950 shadow-2xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/">
              <ArrowLeft /> Back to store
            </Link>
          </Button>
          <div className="mb-7 flex items-center gap-3">
            <span className="relative size-11 overflow-hidden rounded-full bg-stone-950 ring-1 ring-stone-200">
              <Image
                src="/favicon.jpg"
                alt=""
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <div>
              <h1 className="text-2xl font-normal">Admin login</h1>
              <p className="text-sm text-stone-500">Supabase authenticated access</p>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={login}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
            </div>
            {message && <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">{message}</p>}
            <Button className="h-11 rounded-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />}
              Sign in
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
