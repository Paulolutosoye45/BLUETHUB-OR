import Cube from "@/assets/svg/cube.svg?react";
import my_course from "@/assets/svg/scourses.svg?react";
import { cn } from "@/lib/utils";

const CourseList = () => {
  const courses = [
    { subject: "Mathematics", progress: 85, displayImage: Cube },
    { subject: "English", progress: 65, displayImage: my_course },
    { subject: "Basic Science", progress: 30, displayImage: my_course },
  ];

  // function to get gradient color based on progress %
  const getProgressColor = (progress: number) => {
    if (progress <= 40) return { start: "#EF4444", end: "#FCA5A5" }; // red
    if (progress <= 70) return { start: "#FBBF24", end: "#FDE68A" }; // yellow
    return { start: "#4F61E8", end: "#B8CBF8" }; // green
  };

  return (
    <div className="space-y-4">
      {courses.map((course, idx) => {
        const Icon = course.displayImage;
        const { start, end } = getProgressColor(course.progress);

        return (
          <div
            key={idx}
            className="flex flex-col gap-4 rounded-[22px] border border-slate-100 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(243,246,255,0.95))] px-5 py-5  transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-24px_rgba(79,97,232,0.7)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                <Icon className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-poppins text-base font-semibold text-slate-900">
                  {course.subject}
                </h3>
                <p className="font-poppins text-sm font-medium text-slate-500">
                  Progress: {course.progress}%
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-[220px]">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>Completion</span>
                <span className={cn(
                  course.progress <= 40 && "text-rose-500",
                  course.progress > 40 && course.progress <= 70 && "text-amber-500",
                  course.progress > 70 && "text-[#4F61E8]"
                )}>{course.progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${course.progress}%`,
                    background: `linear-gradient(to right, ${start}, ${end})`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default CourseList;
