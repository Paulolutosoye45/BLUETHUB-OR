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
    <div className="overflow-hidden rounded-[26px] border border-white/75 bg-white/82 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-poppins text-lg font-semibold text-slate-900 capitalize">
            Upcoming live class{" "}
          </h2>
            <p className="mt-1 text-sm text-slate-500">Your next scheduled sessions and recordings.</p>
          </div>
          <button type="button" className="rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#4F61E8] transition-colors hover:bg-[#e0e7ff]">View all</button>
        </div>
        <section className="px-5 py-5">
          <div className="space-y-4 ">
            {liveClasses.map((liveClass, index) => {
              const Icons = liveClass.icon;
              return (
                <div key={`${liveClass.subject}-${index}`} className="flex items-center gap-3 justify-between rounded-[22px] border border-slate-100 bg-slate-50/80 px-4 py-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3 ">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100">
                      <Icons className="h-11 w-11" />
                    </div>
                    <div className="space-y-0.5 capitalize">
                      <h3 className="font-poppins text-sm font-semibold text-slate-800">
                        {liveClass.classType}
                      </h3>
                      <p className="font-poppins text-xs font-medium text-slate-500">
                        {liveClass.subject}
                      </p>
                      <p className="font-poppins text-xs font-medium text-slate-400">
                        {liveClass.date}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-poppins text-sm font-semibold text-slate-700 capitalize">
                      {liveClass.teacher}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
    </div>
  );
};

export default UpcomingClass;
