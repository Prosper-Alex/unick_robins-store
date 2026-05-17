"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export type AuthMode = "login" | "register" | "forgot_password";

const OTP_PENDING_STORAGE_KEY = "unick-auth-otp-pending";
const OTP_PENDING_MAX_AGE_MS = 30 * 60 * 1000;

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>(getInitialAuthMode);

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

function getInitialAuthMode(): AuthMode {
  if (typeof window === "undefined") {
    return "login";
  }

  try {
    const rawValue = window.sessionStorage.getItem(OTP_PENDING_STORAGE_KEY);

    if (!rawValue) {
      return "login";
    }

    const parsed = JSON.parse(rawValue) as { mode?: string; createdAt?: number };
    const createdAt = typeof parsed.createdAt === "number" ? parsed.createdAt : 0;

    return Date.now() - createdAt <= OTP_PENDING_MAX_AGE_MS &&
      (parsed.mode === "register" || parsed.mode === "forgot_password")
      ? parsed.mode
      : "login";
  } catch {
    return "login";
  }
}
