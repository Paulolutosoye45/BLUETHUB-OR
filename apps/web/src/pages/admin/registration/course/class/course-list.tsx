// import type { course } from "@/utils/constant";
import { Label } from "@bluethub/ui-kit";
// import type { ISubjectList } from "./class-registration";

interface CourseListProps {
    title: string;
    courses: any[];
    activeCourses: any[];
    setActiveCourses: React.Dispatch<React.SetStateAction<any[]>>;
}

const CourseList = ({
    title,
    courses,
    activeCourses,
    setActiveCourses,
}: CourseListProps) => {

    
    const handleCheckboxChange = (course: any) => {
        if (activeCourses.some((c) => c.subject === course.subject)) {
            setActiveCourses((prev) =>
                prev.filter((c) => c.subject !== course.subject)
            );
        } else {
            setActiveCourses((prev) => [...prev, course]);
        }
    };

    // useEffect(() => {
    //     console.log("Courses to register:", activeCourses);
    // }, [activeCourses]);

    return (
        <section className="w-full p-4 border-gray-100">
            <h3 className="text-lg font-bold text-[#4F0970] mb-3">{title}</h3>
            {courses.map((courseItem, idx) => (
                <div key={idx} className="flex items-center gap-3 mb-3">
                    <Label className="flex items-center cursor-pointer relative">
                        <input
                            type="checkbox"
                            id={`course-${idx}`}
                            onChange={() => handleCheckboxChange(courseItem)}
                            className="peer size-5 mr-2.5 appearance-none rounded border border-slate-300 checked:bg-chestnut checked:border-chestnut"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-[84%] -translate-y-1/2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-full"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                    </Label>
                    <p className="text-[#4A5D58] font-medium text-base font-poppins">
                        {courseItem.subject}
                    </p>
                </div>
            ))}
        </section>
    );
};

export default CourseList;
