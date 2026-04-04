import Cube from "@/assets/svg/cube.svg?react";
import my_course from "@/assets/svg/scourses.svg?react";

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
            className="border border-black/10 flex items-center justify-between px-8 h-18.5 rounded-[10px]"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-10.5 h-[43.8px]" />

              <div className="space-y-1">
                <h3 className="font-poppins font-medium text-sm text-blck-b2">
                  {course.subject}
                </h3>
                <p className="font-poppins font-medium text-xs text-blck-b2">
                  Progress: {course.progress}%
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-40">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
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
