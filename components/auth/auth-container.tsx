"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export type AuthMode = "login" | "register" | "forgot_password";

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f6e7b7] text-[#31133f]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-normal text-[#fff8df]">
            {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Reset password"}
          </h2>
          <p className="text-sm text-violet-100">
            {mode === "forgot_password" ? (
              <button onClick={() => setMode("login")} className="text-[#f6d87f] hover:underline">
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "login" ? "New here? " : "Already registered? "}
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-[#f6d87f] hover:underline"
                >
                  {mode === "login" ? "Create an account" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <AuthForm mode={mode} setMode={setMode} />
    </div>
  );
}
