import Downloadbtn from "@/assets/svg/downloadv.svg?react";
import Chatroom from "@/assets/svg/Chatroom.svg?react";
import Settings from "@/assets/svg/Qsettings.svg?react";
const QuickAction = () => {
  return (
    <div>
      <div className="border border-blck-b2/20 rounded-[10px] bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]">
        <div className="p-6 border-b border-blck-b2/20 pb-7">
          <h2 className="font-poppins font-medium text-base text-blck-b2 capitalize">
            Quick Action{" "}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <button
            className="flex flex-col items-center justify-center gap-2 border border-gray-300 px-1 rounded-xl py-6"
          >
            <div className="text-blue-600 text-2xl ">
              <Downloadbtn className="text-[#319F43]" />
            </div>
            <p className="text-xs  font-medium text-gray-700 text-center leading-tight">
              Download  Recorded Session
            </p>
          </button>

          {/* 2️⃣ Download Media */}
          <button
            className="flex flex-col items-center justify-center gap-2 border border-gray-300 rounded-xl py-6"
          >
            <div className="text-purple-600 text-2xl">
              <Downloadbtn className="text-[#6C30D4]" />
            </div>
            <p className="text-xs font-medium text-gray-700 text-center leading-tight">
              Download  Media (PDF, MP4)
            </p>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-2 border border-gray-300 rounded-xl py-6 transition-all duration-300"
          >
            <div className="text-yellow-500 text-2xl ">
              <Chatroom />
            </div>
            <p className="text-xs font-medium text-gray-700 text-center">
              Chatroom
            </p>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-2 border border-gray-300 rounded-xl py-6 transition-all duration-300"
          >
            <div className="text-red-500 text-2xl">
              <Settings />
            </div>
            <p className="text-xs font-medium text-gray-700 text-center">
              Settings
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAction;
