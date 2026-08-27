import { Check, X } from "lucide-react";

// ── Password rule checker ──────────────────────────────────
interface Rule {
  label: string;
  test: (val: string) => boolean;
}

export const RULES: Rule[] = [
  { label: "At least 8 characters",           test: v => v.length >= 8 },
  { label: "One uppercase letter (A-Z)",       test: v => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a-z)",       test: v => /[a-z]/.test(v) },
  { label: "One number (0-9)",                 test: v => /[0-9]/.test(v) },
  { label: "One special character (!@#$...)",  test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export function PasswordRules({ password, oldPassword }: { password: string; oldPassword: string }) {
  const allRules: Rule[] = [
    ...RULES,
    {
      label: "Different from current password",
      test: v => v.length > 0 && v !== oldPassword,
    },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl font-poppins p-4 space-y-2 mt-2">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
        Password requirements
      </p>
      {allRules.map(rule => {
        const passed = rule.test(password);
        return (
          <div key={rule.label} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all ${
              passed ? "bg-emerald-500" : "bg-gray-200"
            }`}>
              {passed
                ? <Check className="w-2.5 h-2.5 text-white" />
                : <X className="w-2.5 h-2.5 text-gray-400" />
              }
            </div>
            <span className={`text-[12.5px] transition-colors ${
              passed ? "text-emerald-600 font-medium" : "text-gray-400"
            }`}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}