"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AuthMode } from "./auth-container";

const authInputClassName =
  "h-12 rounded-full  bg-[rgba(246,216,127,0.2)] px-5 text-white caret-[#f6d87f]  placeholder:text-violet-100/55 border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6d87f]";
export function AuthForm({
  mode,
  setMode,
}: {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh: refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isOtpStep = mode === "register" && pendingVerificationEmail !== null;
  const isResetOtpStep = mode === "forgot_password" && pendingResetEmail !== null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "forgot_password") {
        if (isResetOtpStep) {
          const response = await fetch("/api/auth/verify-reset-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pendingResetEmail, token: otp }),
          });
          const result = (await response.json()) as {
            error?: string;
          };

          if (!response.ok) {
            setMessage(result.error ?? "Verification failed.");
            return;
          }

          await refreshAuth();
          router.replace("/account/update-password");
          return;
        }

        const response = await fetch(`/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        const result = (await response.json()) as {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          setMessage(result.error ?? "Failed to request password reset.");
        } else {
          setPendingResetEmail(normalizedEmail);
          setOtp("");
          setMessage(result.message ?? "Check your email for the password reset code.");
        }
        return;
      }

      if (mode === "register") {
        if (isOtpStep) {
          const response = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: pendingVerificationEmail, token: otp }),
          });
          const result = (await response.json()) as {
            error?: string;
            role?: string;
          };

          if (!response.ok) {
            setMessage(result.error ?? "Verification failed.");
            return;
          }

          if (result.role === "admin") {
            await refreshAuth();
            router.replace("/admin");
          } else {
            await refreshAuth();
            router.replace(getSafeNextPath(searchParams.get("next")) ?? "/products");
          }

          return;
        }

        const validationMessage = validateNewPassword(password);

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
      const result = (await response.json()) as {
        error?: string;
        message?: string;
        role?: string;
        requiresEmailOtpVerification?: boolean;
      };

      if (!response.ok) {
        setMessage(result.error ?? "Authentication failed.");
        return;
      }

      if (result.requiresEmailOtpVerification) {
        setPendingVerificationEmail(normalizedEmail);
        setMessage(
          result.message ??
            "Account created. Check your email for the one-time code before signing in.",
        );
        setPassword("");
        return;
      }

      if (result.role === "admin") {
        await refreshAuth();
        router.replace(getSafeNextPath(searchParams.get("next")) ?? "/admin");
      } else {
        await refreshAuth();
        router.replace(getSafeNextPath(searchParams.get("next")) ?? "/products");
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
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isOtpStep || isResetOtpStep}
          className={authInputClassName}
        />
      </div>

      {mode !== "forgot_password" && !isOtpStep && !isResetOtpStep && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot_password")}
                className="text-xs text-[#f6d87f] hover:underline">
                Forgot your password?
              </button>
            )}
          </div>
          <PasswordInput
            id="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            show={showPassword}
            toggleShow={() => setShowPassword((current) => !current)}
            value={password}
            onChange={setPassword}
          />
        </div>
      )}

      {mode === "register" && !isOtpStep && (
        <p className="text-xs leading-5 text-violet-100">
          Use 8+ characters with uppercase, lowercase, and a number or symbol.
        </p>
      )}

      {isOtpStep && (
        <div className="grid gap-2">
          <label htmlFor="otp" className="text-sm font-medium">
            Verify OTP
          </label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className={authInputClassName}
          />
          <p className="text-xs leading-5 text-violet-100">
            Enter the verification code sent to {pendingVerificationEmail}.
          </p>
        </div>
      )}

      {isResetOtpStep && (
        <div className="grid gap-2">
          <label htmlFor="resetOtp" className="text-sm font-medium">
            Verify reset code
          </label>
          <Input
            id="resetOtp"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className={authInputClassName}
          />
          <p className="text-xs leading-5 text-violet-100">
            Enter the password reset code sent to {pendingResetEmail}.
          </p>
        </div>
      )}

      {message && (
        <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-violet-50">
          {message}
        </p>
      )}

      <Button className="h-12 rounded-full" disabled={loading}>
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : mode === "login" ? (
          <LockKeyhole />
        ) : (
          <UserPlus />
        )}
        {mode === "forgot_password"
          ? isResetOtpStep
            ? "Verify reset code"
            : "Send reset code"
          : mode === "login"
            ? "Sign in"
            : isOtpStep
              ? "Verify OTP"
              : "Create account"}
      </Button>
    </form>
  );
}

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
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
        className={`${authInputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-violet-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6d87f]"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function validateNewPassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[\d\W_]/.test(password)
  ) {
    return "Password must include uppercase, lowercase, and a number or symbol.";
  }

  return null;
}
