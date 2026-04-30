import InfoRow from "@/shared/info-row";
import {
  Dialog,
  DialogContent,
  Button
} from "@bluethub/ui-kit";
import { CheckCircle2 } from "lucide-react";
 
// ─── Decorative Dots ──────────────────────────────────────────────────────────
 
 export function Dots() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 340 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* top-left cluster */}
      <circle cx="48" cy="38" r="4" fill="#4ade80" opacity="0.7" />
      <circle cx="68" cy="22" r="3" fill="#818cf8" opacity="0.6" />
      <circle cx="30" cy="60" r="2.5" fill="#818cf8" opacity="0.5" />
      <circle cx="80" cy="50" r="2" fill="#4ade80" opacity="0.4" />
 
      {/* top-right cluster */}
      <circle cx="265" cy="22" r="3" fill="#818cf8" opacity="0.6" />
      <circle cx="290" cy="40" r="4" fill="#4ade80" opacity="0.6" />
      <circle cx="310" cy="20" r="2.5" fill="#818cf8" opacity="0.5" />
      <circle cx="252" cy="50" r="2" fill="#4ade80" opacity="0.4" />
      <circle cx="305" cy="58" r="2" fill="#818cf8" opacity="0.35" />
 
      {/* bottom scattered */}
      <circle cx="55" cy="120" r="2.5" fill="#4ade80" opacity="0.3" />
      <circle cx="285" cy="115" r="2.5" fill="#818cf8" opacity="0.3" />
    </svg>
  );
}
 
export function SubjectRegisteredDialog({
  open,
  onClose,
  onAddAnother,
  onViewAll,
}: {
  open: boolean;
  onClose: () => void;
  onAddAnother?: () => void;
  onViewAll?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-90 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white gap-0">
        {/* ── Hero Banner ── */}
        <div className="relative bg-chestnut flex flex-col items-center pt-10 pb-8 overflow-hidden">
          <Dots />
 
          {/* Icon */}
          <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 border-2 border-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
 
          <h2 className="relative z-10 text-white text-base font-semibold  mb-1">
            Subject Registered!
          </h2>
          <p className="relative z-10 text-[#FFFFFFBF] text-sm font-normal text-center leading-snug px-10">
            All Subject has been added<br />to the school subject portal
          </p>
        </div>
 
        {/* ── Info Rows ── */}
        <div className="px-5 pt-5 pb-4 space-y-2.5">
          <InfoRow label="Subject" value="All Subjects" />
          <InfoRow label="Subject teacher" value="No Class Teacher Is Assigned Yet" valueClass="text-gray-400 text-xs text-right max-w-[160px] leading-snug" />
          <InfoRow
            label="Status"
            value="Registered"
            valueClass="text-emerald-500 text-sm font-medium"
            registered
          />
        </div>
 
        {/* ── Divider ── */}
        <div className="mx-5 border-t-2 border-gray-100" />
 
        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 px-5 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAnother}
            className="text-xs px-5 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Add Another
          </Button>
          <Button
            size="sm"
            onClick={onViewAll}
            className="text-xs px-5 bg-chestnut hover:bg-[#2d2a6e] text-white rounded-md"
          >
            View All subject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}