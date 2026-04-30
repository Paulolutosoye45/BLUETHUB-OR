import {Info, Plus} from "lucide-react";

import {
  Button,
} from "@bluethub/ui-kit";


const TeacherAppBar = () => {
  return (
    <div>
    <div className="bg-chestnut h-29.5 p-4 rounded-[15px] flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="font-bold text-lg leading-7 text-white">Good morning, Mrs. Adaeze ✨</h2>
        <p className="text-[#D9D9D9] font-medium text-xs">You have 3 classes today and 5 assessments awaiting submission</p>
        <div className="bg-[#D9D9D980] px-3 py-1 rounded-[15px] flex items-center gap-1.25 w-60">
          <Info className="text-white size-3" />
          <span className="text-xs leading-4.75 text-white">3 lessons pending admin review</span>
        </div>
      </div>
      <div className="flex items-center gap-1.25 justify-between">
        <Button
          className="flex items-center justify-center gap-2 text-chestnut bg-white font-semibold text-sm px-8 py-3 rounded-md transition-opacity hover:bg-white cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="font-medium text-sm">New Assessment </span>
        </Button>
        <Button
          className="flex items-center justify-center gap-2 text-white bg-[#D9D9D966] font-semibold text-sm px-8 py-3 rounded-md transition-opacity hover:bg-[#D9D9D966] cursor-pointer"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="font-medium text-sm">Submit New Lesson</span>
        </Button>
      </div>
    </div>
    </div>
  );
};

export default TeacherAppBar;
