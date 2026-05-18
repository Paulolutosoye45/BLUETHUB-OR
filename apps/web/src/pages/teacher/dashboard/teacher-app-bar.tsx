import  { useAuthContext } from "@/contexts/auth-context";          
import {Info, Plus} from "lucide-react";

import {
  Button,
} from "@bluethub/ui-kit";


const TeacherAppBar = () => {
  const { user } = useAuthContext();

  const today = new Date();

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = `${user?.firstName} ${user?.lastName}`
  return (
    <div className="bg-chestnut p-4 md:p-5 rounded-[15px] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  
  {/* Left: greeting + info */}
  <div className="space-y-1.5">
    <h2 className="font-medium text-lg text-white leading-snug">
      {greeting()}, {name}
    </h2>
    <p className="text-[#D9D9D9] font-medium text-xs">
      You have 3 classes today and 5 assessments awaiting submission
    </p>
    <div className="bg-[#D9D9D980] px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
      <Info className="text-white size-3 shrink-0" />
      <span className="text-xs text-white">3 lessons pending admin review</span>
    </div>
  </div>

  {/* Right: action buttons */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-2 lg:shrink-0">
    <Button className="flex items-center justify-center gap-2 text-chestnut bg-white font-medium text-sm px-6 py-2.5 rounded-md hover:bg-white/90 transition-opacity cursor-pointer">
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      New Assessment
    </Button>
    <Button className="flex items-center justify-center gap-2 text-white bg-[#D9D9D966] font-medium text-sm px-6 py-2.5 rounded-md hover:bg-[#D9D9D980] transition-opacity cursor-pointer">
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      Submit New Lesson
    </Button>
  </div>

</div>
  );
};

export default TeacherAppBar;
