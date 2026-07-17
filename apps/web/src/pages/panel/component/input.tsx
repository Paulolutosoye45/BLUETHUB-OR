export function Input({
  placeholder, icon, value, onChange, type = "text", error,
}: {
  placeholder: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; type?: string; error?: boolean;
}) {
    const inputCls =
  `w-full border rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 transition
    ${error
      ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
      : "border-gray-200 focus:ring-[#4F61E8]/20 focus:border-[#4F61E8]"
    }`;
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${icon ? "pl-9" : ""}`}
      />
    </div>
  );
}