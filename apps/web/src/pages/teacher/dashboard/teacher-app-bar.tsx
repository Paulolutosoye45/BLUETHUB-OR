import { useAuthContext } from "@/contexts/auth-context";
import { Plus } from "lucide-react";

import {
  Button,
} from "@bluethub/ui-kit";


const TeacherAppBar = () => {
  const { user } = useAuthContext();
  const name = `${user?.firstName} ${user?.lastName}`
  return (
    <div>
      <div className="bg-chestnut p-3  md:p-3 md:mb-4 rounded-[12px] flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-medium text-xs md:text-sm text-white">Welcome Back, {name}!👋</h2>
        </div>
        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button className="flex items-center gap-1.5 text-chestnut bg-white font-medium text-xs px-3 py-2 rounded-md hover:bg-white/90 transition-opacity cursor-pointer">
            <Plus className="size-3.5 shrink-0" aria-hidden="true" />
            <span>New Assessment</span>
          </Button>
          <Button className="flex items-center gap-1.5 text-white bg-[#D9D9D966] font-medium text-xs px-3 py-2 rounded-md hover:bg-[#D9D9D980] transition-opacity cursor-pointer">
            <Plus className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Submit New Lesson</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAppBar;
