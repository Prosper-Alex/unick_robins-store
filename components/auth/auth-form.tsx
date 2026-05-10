"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AuthMode } from "./auth-container";

export function AuthForm({ mode, setMode }: { mode: AuthMode; setMode: (m: AuthMode) => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "forgot_password") {
        const response = await fetch(`/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        const result = await response.json() as { error?: string; message?: string };

        if (!response.ok) {
          setMessage(result.error ?? "Failed to request password reset.");
        } else {
          setMessage(result.message ?? "Check your email for a reset link!");
        }
        return;
      }

      if (mode === "register") {
        const validationMessage = validateNewPassword(password, confirmPassword);

        if (validationMessage) {
          setMessage(validationMessage);
          return;
        }
      }

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const result = await response.json() as { error?: string; role?: string };

      if (!response.ok) {
        setMessage(result.error ?? "Authentication failed.");
        return;
      }

      if (result.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/products");
      }
    } catch {
      setMessage("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email address</label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-full bg-white px-5 text-[#24102f]"
        />
      </div>
      
      {mode !== "forgot_password" && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot_password")}
                className="text-xs text-[#f6d87f] hover:underline"
              >
                Forgot your password?
              </button>
            )}
          </div>
          <PasswordInput
            id="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            show={showPassword}
            toggleShow={() => setShowPassword((current) => !current)}
            value={password}
            onChange={setPassword}
          />
        </div>
      )}

      {mode === "register" && (
        <div className="grid gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            show={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword((current) => !current)}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <p className="text-xs leading-5 text-violet-100">
            Use 8+ characters with uppercase, lowercase, and a number or symbol.
          </p>
        </div>
      )}

      {message && <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-violet-50">{message}</p>}
      
      <Button className="h-12 rounded-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : mode === "login" ? <LockKeyhole /> : <UserPlus />}
        {mode === "forgot_password" ? "Send reset link" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}

function PasswordInput({
  id,
  autoComplete,
  show,
  toggleShow,
  value,
  onChange,
}: {
  id: string;
  autoComplete: string;
  show: boolean;
  toggleShow: () => void;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-full bg-white px-5 pr-12 text-[#24102f]"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#4b1f61] transition hover:bg-[#4b1f61]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6d87f]"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function validateNewPassword(password: string, confirmPassword: string) {
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[\d\W_]/.test(password)) {
    return "Password must include uppercase, lowercase, and a number or symbol.";
  }

  return null;
}
