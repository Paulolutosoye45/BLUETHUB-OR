import { ArrowLeft, Clock5, SlidersHorizontal } from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import { useNavigate } from "react-router-dom";

// Define types
type ClassStatus = "Pending" | "Approval" | "On Review" | "Rejected";

interface ClassApproval {
  id: string | number;
  title: string;
  date: string;
  status: ClassStatus;
}

const ApprovalStatus = () => {
  const navigate = useNavigate();

  // ✅ mock data (replace later with API data)
  const classes: ClassApproval[] = [
    {
      id: 1,
      title: "Mathematics : Algebra",
      date: "23 August, 2025",
      status: "Pending",
    },
    {
      id: 2,
      title: "Mathematics : Quadratic Equation",
      date: "23 August, 2025",
      status: "On Review",
    },
    {
      id: 3,
      title: "Physics : Force And Kinetic Energy",
      date: "23 August, 2025",
      status: "On Review",
    },
    {
      id: 4,
      title: "Physics : Force II",
      date: "23 August, 2025",
      status: "Approval",
    },
    {
      id: 5,
      title: "Mathematics : Probability",
      date: "23 August, 2025",
      status: "Rejected",
    },
  ];

  // ✅ helper function for color coding
  const getStatusStyle = (status: ClassStatus) => {
    switch (status) {
      case "Pending":
        return {
          border: "border-[#FFC983]",
          text: "text-[#AC6100]",
          bg: "bg-[#FFF8EE]",
          iconColor: "text-[#B66E10]",
          badgeBg: "bg-[#FFE9C7]",
        };
      case "Approval":
        return {
          border: "border-[#B7F3BD]",
          text: "text-[#0B7B10]",
          bg: "bg-[#F5FFF6]",
          iconColor: "text-[#1A9B2B]",
          badgeBg: "bg-[#E1FFEA]",
        };
      case "On Review":
        return {
          border: "border-[#89CFF3]",
          text: "text-[#065986]",
          bg: "bg-[#E9F6FF]",
          iconColor: "text-[#0071BC]",
          badgeBg: "bg-[#CFE9FF]",
        };
      case "Rejected":
        return {
          border: "border-[#F5B5B5]",
          text: "text-[#B50000]",
          bg: "bg-[#FFF0F0]",
          iconColor: "text-[#D00000]",
          badgeBg: "bg-[#FFD6D6]",
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen ">

      <div className="max-w-6xl mx-auto rounded-xl shadow-lg bg-white overflow-hidden mt-5">
      <div className="bg-linear-to-r from-chestnut to-chestnut/90 px-6 py-5 flex items-center justify-between">
  
  {/* Left — back + title */}
  <div className="flex gap-3 items-center">
    <ArrowLeft
      size={20}
      className="text-white cursor-pointer hover:text-white/70 transition-colors"
      onClick={() => navigate(-1)}
    />
    <h2 className="text-white font-semibold text-[17px]">
      Check Class Approval Portal
    </h2>
  </div>

  {/* Right — filter button */}
  <button
    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30
               border border-white/20 text-white px-4 py-1.5 rounded-full
               transition-all duration-200 cursor-pointer"
  >
    <SlidersHorizontal size={15} />
    <span className="font-medium text-[13px]">Filter</span>
  </button>

</div>

        {/* Info banner */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 rounded-md bg-[#FFC983] border-none hover:bg-[#FFB956] p-2.5"
            >
              <Clock5 className="w-4 h-4 text-[#B66E10]" />
              <span className="text-[#AC6100] font-semibold text-sm">
                Pending Approval
              </span>
            </Button>
            <p className="text-[#AC6100] font-medium leading-3.75 text-sm">
              Your class is waiting for approval from the administrator
            </p>
          </div>
        </div>

        {/* Class list */}
        <div className="px-6 pb-8 space-y-4">
          {classes.map((cls) => {
            const style = getStatusStyle(cls.status);
            return (
              <div
                key={cls.id}
                onClick={() => navigate(`/teacher/recorded-class/classes/approval-status/${cls.id}`)}
                className={`cursor-pointer rounded-lg border ${style.border} ${style.bg} flex flex-col sm:flex-row justify-between items-center px-4 py-4 transition-all hover:shadow-md hover:scale-[1.01]`}
              >
                <h3 className={`font-semibold text-[16px] ${style.text}`}>
                  {cls.title}
                </h3>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock5 className="w-4 h-4" />
                    <span>{cls.date}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 ${style.badgeBg} ${style.text}`}
                  >
                    <Clock5 className={`w-3 h-3 ${style.iconColor}`} />
                    <span>{cls.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatus;
