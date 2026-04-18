import { CheckCircle2 } from "lucide-react";

function InfoRow({
  label,
  value,
  valueClass = "text-gray-400 text-sm",
  registered = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  registered?: boolean;
}) {
  return (
        <div className=" font-poppins flex items-center justify-between border-2 bg-[#F3F6FF] border-[#D9D9D9] rounded-lg px-4 py-3">
      <span className=" text-chestnut text-sm">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={valueClass}>{value}</span>
        {registered && (
          <CheckCircle2 size={16} className="text-emerald-500" />
        )}
      </div>
    </div>
  );
}

export default InfoRow