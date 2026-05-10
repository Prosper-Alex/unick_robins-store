import type { ReactNode } from "react";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white">
        {children}
      </main>
      <Footer />
    </>
  );
}
