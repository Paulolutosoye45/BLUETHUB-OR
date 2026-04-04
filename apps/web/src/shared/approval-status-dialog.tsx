import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button
} from "@bluethub/ui-kit";
import Check_P from "@/assets/svg/check-perspective.svg?react";
import Circle_Check from "@/assets/svg/circle_check.svg?react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ClassStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approved" | "submitted";
  date?: string;
  onBack?: () => void;
  onCheckStatus?: () => void;
}

const ApprovalStatusDialog = ({
  open,
  onOpenChange,
  type,
  date,
  onBack,
  onCheckStatus,
}: ClassStatusDialogProps) => {
  const isApproved = type === "approved";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-115 rounded-2xl bg-white p-8 text-center flex flex-col items-center justify-center">
        {/* ✅ Icon Section */}
        <div className="mb-6">
          {isApproved ? (
            <Check_P className="mx-auto w-17.5 h-17.5" />
          ) : (
            <Check_P className="mx-auto w-17.5 h-17.5" />
          )}
        </div>

        {/* ✅ Header Section */}
        <AlertDialogHeader className="mb-5">
          <AlertDialogTitle className="text-[20px] text-center font-semibold text-blck-b2 font-poppins">
            {isApproved
              ? "Your Class Has Been Approved"
              : "Your Class Has Been Submitted"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-center px-7   text-[#3A3A3AA6] font-medium mt-1">
            {isApproved
              ? "You Will Be Notified Via Email"
              : "You Will Be Notified Via Email When Your Class Has Been Approved"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ✅ Conditional Button Section */}
        <div className="mb-2">
          {isApproved ? (
            <Button
              variant="outline"
              disabled
              className="bg-[#9EC75980] hover:bg-[#9EC75980] border-none cursor-default rounded-md py-2 px-4 "
            >
              <span className="text-[#5E8D0E] font-medium text-sm">
                Date: {date || "23th September 2025, 9:50AM"}
              </span>
            </Button>
          ) : (
            <Link to="/teacher/recorded-class/classes/approval-status">
            <Button
              variant="outline"
              onClick={onCheckStatus}
              className="flex items-center w-[306.7px] justify-center gap-2 rounded-md bg-[#FFC983] border-none hover:bg-[#FFB956] py-2 px-5"
            >
              <span className="text-[#AC6100] font-semibold text-sm">
                Check Approval Status
              </span>
              <ArrowRight className="w-4 h-4 text-[#B66E10]" />
            </Button>
            </Link>
          )}
        </div>

        {/* ✅ Notification Section */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Circle_Check className="w-4 h-4" />
          <h2 className="text-sm text-[#4F61E8D9] font-medium">
            Notify me via email or in-app
          </h2>
        </div>

        {/* ✅ Footer Section */}
        <AlertDialogFooter className="flex justify-center">

          <Link to="/teacher">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-md bg-[#4F61E814] border-none hover:bg-[#EEF2FF] py-2 px-5"
          >
            <ArrowLeft className="w-4 h-4 text-student-chestnut" />
            <span className="text-student-chestnut font-medium text-base">
              Back To Dashboard
            </span>
          </Button>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApprovalStatusDialog;
