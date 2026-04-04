import test_profile from "@/assets/png/test_profile.png";
import Time from "@/assets/svg/time-fill.svg?react";
import { CalendarRange } from "lucide-react";

const RecordedAppbar = () => {
  return (
    <div className="bg-white rounded-[15px] flex flex-col md:flex-row items-center justify-between px-6 py-4 shadow mb-4 w-full">
      {/* Left: Profile + Recording Info */}
      <div className="flex items-center gap-6 w-full md:w-auto mb-3 md:mb-0">
        <div className="flex justify-center items-center bg-[#D9D9D9] rounded-full border-2 border-[#34A9FF] w-10.5 h-10.5">
          <img
            src={test_profile}
            alt="profile"
            className="object-cover rounded-full w-9.75 h-9.5"
          />
        </div>
        <p className="font-poppins font-medium text-base text-student-chestnut capitalize">
          Dr Roy Akinwale
        </p>
        <div className="bg-[#ECFBEF] flex items-center gap-2 px-3 py-1 rounded-md">
          <div className="bg-[#EC1B2C] rounded-full w-3 h-3"></div>
          <p className="font-medium text-[#00A912] text-sm">Recording</p>
        </div>
      </div>

      {/* Right: Date & Time */}
      <div className="flex items-center gap-6 w-full md:w-auto justify-end">
        {/* Date */}
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-chestnut" />
          <span className="font-medium text-xs text-chestnut">Oct 11, 2025</span>
        </div>
        {/* Time */}
        <div className="flex items-center gap-2">
          <Time className="text-[#29238280] w-5 h-5" />
          <span className="text-chestnut text-xs font-medium">10:24 AM</span>
        </div>
      </div>
    </div>
  );
};

export default RecordedAppbar;
