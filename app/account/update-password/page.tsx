import { Sparkles } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata = {
  title: "Update Password | Unick Robins",
  description: "Set a new password for your Unick Robins account.",
};

export default function UpdatePasswordPage() {
  return (
    <AccountShell>
      <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f6d87f]">
              Password settings
            </p>
            <h1 className="mt-4 text-4xl font-normal leading-[1.1] tracking-tight text-[#fff8df] sm:text-5xl">
              Keep your account access current.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-violet-100 sm:text-lg sm:leading-8">
              Verified reset codes sign you back in before you choose a new password. Signed-in customers can use the same page from account settings.
            </p>
          </div>

          <div className="w-full max-w-[460px] lg:ml-auto">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20">
              <div className="mb-7 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-[#f6e7b7] text-[#31133f]">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-normal text-[#fff8df]">
                    Secure your account
                  </h2>
                  <p className="text-sm text-violet-100">
                    Choose a new strong password
                  </p>
                </div>
              </div>
              <UpdatePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
