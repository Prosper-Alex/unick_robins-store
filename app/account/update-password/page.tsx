import { Sparkles } from "lucide-react";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata = {
  title: "Update Password | Unick Robins",
  description: "Set a new password for your Unick Robins account.",
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12">
      <div className="w-full max-w-[440px]">
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
  );
}
