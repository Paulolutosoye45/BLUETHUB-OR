import { AxiosError } from "axios";
import { AlertTriangle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { authService } from "@/services/auth";
import { Hashing, localData } from "@/utils";
import { resetPasswordSchema } from "@/utils/validate";

interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  // "expired" covers 99107 (invalid/used/expired token) — anything else
  // returned by the API (missing fields, mismatch, same-as-current) is a
  // field-level 99001 message shown inline instead.
  const [expired, setExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const stored =
      localData.retrieve<{ logoUrl: string; schoolName: string }>("th_school") ??
      localData.retrieve<{ logoUrl: string; schoolName: string }>("schoolInfo");
    if (stored?.logoUrl) setSchoolLogoUrl(stored.logoUrl);
    if (stored?.schoolName) setSchoolName(stored.schoolName);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: yupResolver(resetPasswordSchema) });

  const handleResetPassword = async (data: ResetPasswordInput) => {
    if (!token) return;
    setErrorMsg("");
    try {
      setLoading(true);
      const [newHashPassword, confirmHashPassword] = await Promise.all([
        Hashing(data.password),
        Hashing(data.confirmPassword),
      ]);
      const response = await authService.resetPassword({
        token,
        newHashPassword,
        confirmHashPassword,
      });
      const body = response.data;

      if (body.responseCode === "99000") {
        toast.success("Password updated. You can now log in with your new password.");
        navigate("/auth");
        return;
      }

      if (body.responseCode === "99107") {
        setExpired(true);
        return;
      }

      // 99001 — missing fields, mismatch, or same-as-current
      setErrorMsg(body.responseMessage);
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.responseMessage ??
          error.response?.data?.message ??
          error.message
          : (error as Error).message;
      setErrorMsg(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showExpiredState = !token || expired;

  return (
    <div className="font-poppins flex flex-col gap-10 justify-center h-full rounded-[18px] py-13 px-7.5 shadow-[0_4px_16px_0px_rgba(41,35,130,0.08),0_24px_64px_0px_rgba(41,35,130,0.13)] lg:px-0 md:shadow-none md:max-w-md mx-auto lg:py-10">
      <div>
        {/* ── School branding ── */}
        {schoolLogoUrl && (
          <div className="mb-6">
            <img
              src={schoolLogoUrl}
              alt={schoolName ?? "School logo"}
              loading="lazy"
              className="h-8 w-auto object-contain"
            />
          </div>
        )}

        {showExpiredState ? (
          <>
            <div className="mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h1 className="text-2xl font-Poppins font-bold text-[#0F0F0E]">
                {token ? "This link has expired or was already used" : "Invalid reset link"}
              </h1>
              <p className="text-gray-400 font-Poppins text-sm mt-1.5">
                {token
                  ? "Password reset links are only valid for a limited time and can only be used once."
                  : "This link is missing a reset token. Please request a new one."}
              </p>
            </div>
            <Link
              to="/auth/forgot-password"
              className="block text-center w-full py-3 font-Poppins rounded-lg bg-chestnut text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            {/* ── Heading ── */}
            <div className="mb-8">
              <span className="text-xs font-Poppins font-bold text-chestnut uppercase tracking-widest">
                Reset Password
              </span>
              <h1 className="text-2xl font-Poppins font-bold text-[#0F0F0E] mt-1">
                Set a new password
              </h1>
              <p className="text-gray-400 font-Poppins text-sm mt-1.5">
                Choose a new password for your account. This link expires in 1 hour.
              </p>
            </div>

            {/* ── Inline error banner ── */}
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-5"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="password" className="block font-Poppins text-sm font-semibold text-[#0F0F0E]">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full border font-Poppins border-gray-200 rounded-lg pl-9 pr-11 py-2.5 text-sm outline-none focus:ring-2 focus:ring-chestnut/30 focus:border-chestnut/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 font-Poppins text-xs pl-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block font-Poppins text-sm font-semibold text-[#0F0F0E]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full border font-Poppins border-gray-200 rounded-lg pl-9 pr-11 py-2.5 text-sm outline-none focus:ring-2 focus:ring-chestnut/30 focus:border-chestnut/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 font-Poppins text-xs pl-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-Poppins rounded-lg bg-chestnut text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
