// import { useAuthContext } from "@/contexts/auth-context";
// import type { SchoolInfo } from "@/services";
// import { localData } from "@/utils";
import { Button } from "@bluethub/ui-kit";
import { Plus, Triangle, } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminAppbar = () => {
  const navigate = useNavigate()
  // const { user } = useAuthContext();
  const today = new Date();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // const formattedDate = today.toLocaleDateString("en-US", {
  //   weekday: "long",
  //   month: "long",
  //   day: "numeric",
  //   year: "numeric",
  // });

  // const schoolProfile = localData.retrieve("schoolInfo") as SchoolInfo | null;

  // const initials = [user?.firstName, user?.lastName]
  //   .filter(Boolean)
  //   .map((n) => n![0].toUpperCase())
  //   .join("") || "AD";

  return (
    <div>
      <div className="flex flex-col gap-5 md:gap-0 md:flex-row items-start justify-between mb-4">
        <div>
          <h1 className="text-lg leading-[28.8px] font-medium text-[#0F0F0E]">
            {greeting()}, Mr. Okafor
          </h1>
          <p className="text-xs  font-normal text-[#666666] mt-0.5">
            Second term 2025/2026  ·  5 lessons pending  ·  2 new registrations today
          </p>
        </div>
        <div className="flex items-center gap-3 justify-between">
          <Button
            // onClick={() => navigate('/admin/registration/class/new')}
            className="flex items-center  gap-1.5 px-3.5 py-2 rounded-lg text-[#0F0F0E] text-xs font-medium  bg-white shrink-0 transition-opacity border border-[#E8E8E3] hover:bg-white"
          >
            <Plus className="text-[#0F0F0E]" />
            Add user
          </Button>

          <Button
            onClick={() => navigate('/teacher/create-syllabus')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold  bg-chestnut shrink-0 transition-opacity hover:opacity-90"
          >
            <Triangle />
            Review lessons
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppbar;
