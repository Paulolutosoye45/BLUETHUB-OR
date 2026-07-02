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
    <div className="overflow-hidden rounded-md border border-white/75 bg-white/82 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="font-poppins text-sm font-semibold text-slate-900 capitalize">
            Upcoming live class
          </h2>
            <p className="mt-0.5 text-xs text-slate-500">Your next scheduled sessions.</p>
          </div>
          <button type="button" className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#4F61E8] transition-colors hover:bg-[#e0e7ff]">View all</button>
        </div>
        <section className="px-4 py-3">
          <div className="space-y-2">
            {liveClasses.map((liveClass, index) => {
              const Icons = liveClass.icon;
              return (
                <div key={`${liveClass.subject}-${index}`} className="flex items-center gap-2 justify-between rounded-[16px] border border-slate-100 bg-slate-50/80 px-3 py-2.5 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-100">
                      <Icons className="h-7 w-7" />
                    </div>
                    <div className="space-y-0 capitalize">
                      <h3 className="font-poppins text-xs font-semibold text-slate-800">
                        {liveClass.classType}
                      </h3>
                      <p className="font-poppins text-[10px] font-medium text-slate-500">
                        {liveClass.subject}
                      </p>
                      <p className="font-poppins text-[10px] font-medium text-slate-400">
                        {liveClass.date}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-poppins text-xs font-semibold text-slate-700 capitalize">
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
