import { useEffect, useState } from "react";
import type { schoolInfo } from "@/services/index";
import { localData } from "@/utils";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast
} from "@bluethub/ui-kit";

import CourseList from "./course-list";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Label } from "@bluethub/ui-kit";
import { schoolService } from "@/services/school";

export interface ISubjectList {
  subject: string,
  schoolId: string,
  category: string
}

const ClassRegistration = () => {
  const [listAllSubject, setListAllSubject] = useState<ISubjectList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>();
  const [majorCourses, setMajorCourses] = useState<ISubjectList[]>([]);
  const [minorCourses, setMinorCourses] = useState<ISubjectList[]>([]);
  const [activeCourses, setActiveCourses] = useState<ISubjectList[]>([]);
  const [schoolId, setSchoolId] = useState<schoolInfo | null>(null);
  const [loading, _setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Retrieve school info with error handling
  useEffect(() => {
    try {
      const schoolInfo = localData.retrieve("schoolInfo") as schoolInfo;
      if (!schoolInfo?.id) {
        console.error("School info is missing. Cannot proceed.");
        setErrMsg("School information is missing. Please log in again.");
        return;
      }
      setSchoolId(schoolInfo);
    } catch (error) {
      console.error("Error retrieving school info:", error);
      setErrMsg("Failed to retrieve school information.");
    }
  }, []);
  useEffect(() => {
    if (!schoolId?.id) return;

    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        const res = await schoolService.getAllSchoolSubject(schoolId.id);
        setListAllSubject(res?.data?.allSubjects || []);
      } catch (error: any) {
        setIsLoading(false);
        setErrMsg(error?.message);
        toast("Error fetching subjects", {
          description: error?.message || "An error occurred.",
        });
      } finally {
        setIsLoading(false)
      }
    };

    fetchSubjects();
  }, [schoolId?.id]);

  useEffect(() => {
    const majors = listAllSubject.filter((c) => c.category === "Major");
    const minors = listAllSubject.filter((c) => c.category === "Minor");
    setMajorCourses(majors);
    setMinorCourses(minors);
  }, [listAllSubject]);

  const classes = [
  { value: "jss1-love", label: "JSS1 LOVE" },
  { value: "jss1-grace", label: "JSS1 GRACE" },
  { value: "jss1-faith", label: "JSS1 FAITH" },
  { value: "jss2-love", label: "JSS2 LOVE" },
  { value: "jss2-grace", label: "JSS2 GRACE" },
  { value: "jss2-faith", label: "JSS2 FAITH" },
  { value: "jss3-love", label: "JSS3 LOVE" },
  { value: "jss3-grace", label: "JSS3 GRACE" },
  { value: "jss3-faith", label: "JSS3 FAITH" },
  { value: "ss1-love", label: "SS1 LOVE" },
  { value: "ss1-grace", label: "SS1 GRACE" },
  { value: "ss1-faith", label: "SS1 FAITH" },
  { value: "ss2-love", label: "SS2 LOVE" },
  { value: "ss2-grace", label: "SS2 GRACE" },
  { value: "ss2-faith", label: "SS2 FAITH" },
  { value: "ss3-love", label: "SS3 LOVE" },
  { value: "ss3-grace", label: "SS3 GRACE" },
  { value: "ss3-faith", label: "SS3 FAITH" },
];


 const handleSelect = (value: any) => {
    setSelected(value);
    setIsOpen(false);
  };



  // Early return if school info is missing
  if (errMsg && !schoolId) {
    return (
      <section className="min-h-screen flex items-center justify-center m-3 bg-white/90 rounded-2xl shadow-md overflow-hidden p-8">
        <div className="text-center">
          <h2 className="text-red-600 font-semibold text-lg">
            Something went wrong
          </h2>
          <p className="text-gray-500">{errMsg}</p>
        </div>
      </section>
    );
  }

  return (
    <section className=" mx-6 mt-6 bg-white/90 rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <header className="bg-chestnut py-6 px-8 rounded-t-2xl">
        <h1 className="text-white text-3xl font-semibold font-poppins">
          Register Class
        </h1>
      </header>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-10 px-8 py-6">
        {/* Input field */}
        <div className="space-y-7">
          <div className="space-y-3 w-full max-w-105">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
              Category
            </Label>

            <DropdownMenu onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selected
                    ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                    : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                    } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                >
                  <span className={selected ? "text-chestnut font-semibold" : ""}>
                    {selected || "Select subject type"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-chestnut/70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuGroup className="space-y-1">
                  {classes.map(({ label, value }) => (
                    <DropdownMenuItem
                      key={label}
                      className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selected === value
                        ? "bg-chestnut text-white"
                        : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                        }`}
                      onClick={() => handleSelect(value)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{label} </span>
                        {selected === value && (
                          <Check className="w-5 h-5 ml-2 text-white" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
               Class Teacher <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              placeholder="teacher name"
              className="bg-white w-[95%]  ring-2 ring-chestnut/20 focus:outline-none  mt-2 rounded-xl h-11 px-4 text-base font-medium  text-chestnut focus:ring-chestnut/50 focus:ring-2"
            />
          </div>
        </div>

        {/* Subjects display */}
        <div>
          <h2 className="text-center text-2xl text-chestnut font-bold font-poppins mb-4">
            JSS 1 Subjects
          </h2>
          <div className="border-b border-chestnut mb-4"></div>
          {isLoading && (
            <div
              aria-disabled
              className="min-h-125 flex items-center justify-center"
            >
              <Loader2 className="w-16 h-16 text-chestnut animate-spin" />
            </div>
          )}
          {errMsg && schoolId && (
            <div className="text-center">
              <h2 className="text-red-600 font-semibold text-lg">
                Something went wrong
              </h2>
              <p className="text-gray-500">Please try again shortly.</p>
            </div>
          )}
          {!isLoading && !errMsg && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Majors */}
              <CourseList
                title="Major Courses"
                activeCourses={activeCourses}
                setActiveCourses={setActiveCourses}
                courses={majorCourses}
              />
              {/* Minors */}
              <CourseList
                title="Minor Courses"
                activeCourses={activeCourses}
                setActiveCourses={setActiveCourses}
                courses={minorCourses}
              />
            </div>
          )}
          <div className="flex justify-end w-full gap-4 mt-6">
            <button disabled={loading || isLoading} className="px-6 py-2 rounded-md bg-chestnut text-white font-poppins">
              Submit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassRegistration;
