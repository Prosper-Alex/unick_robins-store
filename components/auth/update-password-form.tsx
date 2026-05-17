"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ResetSource = "recovery" | "settings";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<ResetSource>("settings");
  const [tokens, setTokens] = useState<{ access_token: string; refresh_token: string } | null>(null);

  useEffect(() => {
    // Supabase recovery links arrive with tokens in the URL hash fragment.
    const hash = window.location.hash;
    if (!hash) {
      queueMicrotask(() => setReady(true));
      return;
    }

    const hashParams = new URLSearchParams(hash.replace("#", "?"));
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (!access_token || type !== "recovery") {
      queueMicrotask(() => {
        setMessage("Invalid password reset link. Request a new code or sign in to change your password.");
        setReady(true);
      });
      return;
    }

    queueMicrotask(() => {
      setTokens({ access_token, refresh_token: refresh_token || "" });
      setSource("recovery");
      setReady(true);
      window.history.replaceState(null, "", window.location.pathname);
    });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateNewPassword(password, confirmPassword);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          password,
          access_token: tokens?.access_token,
          refresh_token: tokens?.refresh_token,
        }),
      });
      
      const result = await response.json() as { error?: string; role?: string };

      if (!response.ok) {
        setMessage(result.error ?? "Failed to update password.");
        return;
      }

      router.replace(result.role === "admin" ? "/admin" : "/account/dashboard");
    } catch {
      setMessage("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-violet-100" /></div>;
  }

  const form = (
    <form className="grid gap-4" onSubmit={submit}>
      {source === "recovery" && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#f6e7b7]/25 bg-[#f6e7b7]/10 px-4 py-3 text-sm text-violet-50">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#f6e7b7]" />
          <p>Your reset request is verified. Save a new password to continue signed in.</p>
        </div>
      )}
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium">New password</label>
        <PasswordInput
          id="password"
          disabled={loading}
          show={showPassword}
          toggleShow={() => setShowPassword((current) => !current)}
          value={password}
          onChange={setPassword}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</label>
        <PasswordInput
          id="confirmPassword"
          disabled={loading}
          show={showConfirmPassword}
          toggleShow={() => setShowConfirmPassword((current) => !current)}
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <p className="text-xs leading-5 text-violet-100">
          Use 8+ characters with uppercase, lowercase, and a number or symbol.
        </p>
      </div>
      
      {message && <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-violet-50">{message}</p>}
      
      <Button className="h-12 rounded-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Save />}
        Save new password
      </Button>
    </form>
  );

  if (source === "recovery" && tokens) {
    return (
      <Dialog open>
        <DialogContent
          showCloseButton={false}
          className="border-white/10 bg-[#24102f] p-6 text-white sm:max-w-[460px]"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal text-[#fff8df]">
              Update your password
            </DialogTitle>
            <DialogDescription className="text-violet-100">
              Your recovery request checked out. Set a new password and you will be signed in automatically.
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return form;
}

function PasswordInput({
  id,
  disabled,
  show,
  toggleShow,
  value,
  onChange,
}: {
  id: string;
  disabled: boolean;
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
        disabled={disabled}
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-full bg-white px-5 pr-12 text-[#24102f]"
      />
      <button
        type="button"
        onClick={toggleShow}
        disabled={disabled}
        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#4b1f61] transition hover:bg-[#4b1f61]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6d87f] disabled:cursor-not-allowed disabled:opacity-40"
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
