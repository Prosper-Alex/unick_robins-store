"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountSignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/account/logout");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={signOut}
      disabled={loading}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </Button>
  );
}
