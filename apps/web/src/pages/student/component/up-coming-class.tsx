import Cube from "@/assets/svg/cube.svg?react";
const UpcomingClass = () => {
  const liveClasses = [
    {
      classType: "Live Class",
      subject: "Mathematics",
      date: "Today:11:00am",
      teacher: "Dr Akin",
      icon: Cube,
    },
    {
      classType: "Recorded Class ",
      subject: "Computer ",
      date: "Today:2:00pm",
      teacher: "Dr dave",
      icon: Cube,
    },
  ];
  return (
    <div>
      <div className="border border-blck-b2/20 rounded-[10px] bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)]">
        <div className="flex items-center justify-between p-6 border-b border-blck-b2/20 pb-7">
          <h2 className="font-poppins font-medium text-base text-blck-b2 capitalize">
            Upcoming live class{" "}
          </h2>
          <p className="font-poppins font-medium text-sm leading-[100%] text-student-chestnut">
            View all{" "}
          </p>
        </div>
        <section className="px-5 py-7">
          <div className="space-y-4 ">
            {liveClasses.map((liveClass) => {
              const Icons = liveClass.icon;
              return (
                <div className="flex items-center gap-3 justify-between ">
                  <div className="flex items-center gap-3 ">
                    <div>
                      <Icons className="w-[46.02px] h-12" />
                    </div>
                    <div className="space-y-0.5 capitalize">
                      <h3 className="font-poppins font-medium text-sm text-blck-b2/75">
                        {liveClass.classType}
                      </h3>
                      <p className="font-poppins font-medium text-[9px] text-blck-b2/75">
                        {liveClass.subject}
                      </p>
                      <p className="font-poppins font-medium text-[8px] text-blck-b2/75">
                        {liveClass.date}
                      </p>
                    </div>
                  </div>

                  <div>
                    {" "}
                    <p className="font-poppins font-medium text-sm text-blck-b2/75 capitalize">
                      {liveClass.teacher}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UpcomingClass;
