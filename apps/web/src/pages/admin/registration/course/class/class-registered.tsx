import { Button, Dialog, DialogContent } from "@bluethub/ui-kit";
import { Dots } from "./subject-register-dialog";
import { CheckCircle2 } from "lucide-react";
import InfoRow from "@/shared/info-row";

const ClassRegistered = ({ open, onClose, onAddAnother, classRegistered, onViewAll }: { open: boolean; onClose: () => void; onAddAnother?: () => void; onViewAll?: () => void; classRegistered: string }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent  className="max-w-90 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white gap-0">
        {/* ── Hero Banner ── */}
        <div className="relative bg-chestnut flex flex-col items-center pt-10 pb-8 overflow-hidden">
          <Dots />

          {/* Icon */}
          <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 border-2 border-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>

          <h2 className="relative z-10 text-white text-base font-semibold  mb-1">
            Class Registered!
          </h2>
          <p className="relative z-10 text-[#FFFFFFBF] text-sm font-normal text-center leading-snug px-10">
            All Class has been successfully
            <br />added to the academic registry
          </p>
        </div>

        {/* ── Info Rows ── */}
        <div className="px-5 pt-5 pb-4 space-y-2.5">
          <InfoRow label="Class" value={classRegistered} />
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
            Register Another 
          </Button>
          <Button
            size="sm"
            onClick={onViewAll}
            className="text-xs px-5 bg-chestnut hover:bg-[#2d2a6e] text-white rounded-md"
          >
            Go to Dashboard 
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClassRegistered