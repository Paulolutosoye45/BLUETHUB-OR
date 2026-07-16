// ── Field wrapper ─────────────────────────────────────────────────────────────
export function Field({
  label, required, optional, hint, error, children,
}: {
  label: string; required?: boolean; optional?: boolean; hint?: string;
  error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-normal text-[#6B7280] font-space-grotesk">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}