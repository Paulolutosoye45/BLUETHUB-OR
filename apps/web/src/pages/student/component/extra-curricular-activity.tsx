import Cube from "@/assets/svg/cube.svg?react";
import My_course from "@/assets/svg/scourses.svg?react";
import Assignments from "@/assets/svg/assignment.svg?react";
import Play from "@/assets/svg/play.svg?react";
const ExtracurricularActivity = () => {
  return (
    <div className="my-6 flex justify-between items-center gap-4">
      <div className="w-full bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]  px-4 py-6 flex items-center border justify-between border-blck-b` cursor-pointer rounded-[5px]">
        <div>
          <h3 className="font-poppins font-medium text-base text-blck-b2">
            Class{" "}
          </h3>
          <p className="font-poppins text-blck-b2 text-[11px]">
            JSS 1 Peace{" "}
          </p>
        </div>
        <Cube className="w-7.25 h-7.5 ml-2" />
      </div>

      <div className="w-full bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]  px-4 py-6  flex items-center border justify-between border-blck-b` cursor-pointer rounded-[5px]">
        <div>
          <h3 className="font-poppins font-medium text-base text-blck-b2">
            Active Course{" "}
          </h3>
          <p className="font-poppins text-blck-b2 text-[11px]">6 </p>
        </div>
        <div className="">
          <My_course className="w-7.25 h-7.5 ml-2 text-[#E56F8C]" />
        </div>
      </div>

      <div className="w-full bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]  px-4 py-6  flex items-center border justify-between border-blck-b` cursor-pointer rounded-[5px]">
        <div>
          <h3 className="font-poppins font-medium text-base text-blck-b2">
            Pending Assignment{" "}
          </h3>
          <p className="font-poppins text-blck-b2 text-[11px]">2 </p>
        </div>
        <div className="">
          <Assignments className="w-7.25 h-7.5 ml-2 text-Bmark" />
        </div>
      </div>

      <div className="w-full bg-student-chestnut/10 shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]  px-4 py-6  flex items-center border justify-between border-blck-b` cursor-pointer rounded-[5px]">
        <div>
          <h3 className="font-poppins font-medium text-base text-blck-b2">
            Ongoing Class{" "}
          </h3>
          <p className="font-poppins  font-medium text-[#EC1B2C] text-[11px] capitalize ">
            Join Now{" "}
          </p>
        </div>
        <div className="">
          <Play className="w-7.25 h-7.5 ml-2 text-[#EC1B2C]" />
        </div>
      </div>
    </div>
  );
};

export default ExtracurricularActivity;
