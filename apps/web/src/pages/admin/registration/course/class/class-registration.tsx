import { useEffect, useState } from "react";
import type { schoolInfo } from "@/services/index";
import { localData } from "@/utils";
import {
  Button,
  // Command,
  // CommandEmpty,
  // CommandGroup,
  // CommandInput,
  // CommandItem,
  // CommandList,
  toast
} from "@bluethub/ui-kit";

import CourseList from "./course-list";
import { Loader2 } from "lucide-react";
import { Label } from "@bluethub/ui-kit";
import { schoolService, type ICreateSchool } from "@/services/school";
// import { authService } from "@/services/auth";
import { AxiosError } from "axios";
import type { Tuser } from "@/utils/decode";

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
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState<string>()
  // const [teachers, setTeachers] = useState<any[]>([]);
  // const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  // const [teacherSearch, setTeacherSearch] = useState<string>("");
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

  // const getAllTeacher = async () => {
  //   try {
  //     const res = await authService.getTeacher()
  //     setTeachers(res.data) // ← was setBanks
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof AxiosError
  //         ? error.response?.data?.message || error.message
  //         : (error as Error).message;
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   getAllTeacher()
  // }, [])


  const createClassHandler = async () => {
    const createdBy = localData.retrieve("user") as Tuser;
    const schoolId = localData.retrieve("schoolInfo") as schoolInfo;
   if (!activeCourses || activeCourses.length === 0) {
  toast.error('Pick a subject');
  return;
}

    const payload: ICreateSchool = {
      createdBy: createdBy.id,
      SchoolId: schoolId.id,
      classrooms: activeCourses.map((course) => ({
        name: course.subject,
        noOfStudents:1
      })),
    };

    try {
      setLoading(true);
      const res = await schoolService.createClassRoom(payload);
      console.log(res)
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : (error as Error).message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className=" mx-6 mt-6 bg-white/90 min-h-[90vh] rounded-2xl shadow-md overflow-hidden">
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
          {/* <div className="space-y-3 w-full max-w-105">
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
          </div> */}

          <div className="space-y-1">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
              Class
            </Label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="enter class"
              className="bg-white w-full  ring-2 ring-chestnut/20 focus:outline-none  mt-2 rounded-[8px] py-2 px-4 text-base font-medium  text-chestnut focus:ring-chestnut/50 focus:ring-2"
            />
          </div>

          {/* <div className="space-y-2">
            <Label className="text-chestnut font-semibold text-base flex items-center gap-2">
              Class Teacher
            </Label>
            <div className="relative">
              <Command className="bg-white w-full ring-2 ring-chestnut/20 rounded-[8px] overflow-visible">
                <CommandInput
                  placeholder="Search teacher..."
                  value={teacherSearch}
                  onValueChange={(val) => {
                    setTeacherSearch(val);
                    setSelectedTeacher("");
                  }}
                  className="h-11 px-4 text-sm font-medium text-chestnut placeholder:text-chestnut/50 
                   placeholder:font-medium bg-transparent border-none 
                   focus-visible:ring-0 focus-visible:outline-none"
                />
                {teacherSearch && !selectedTeacher && (
                  <CommandList className="absolute top-full left-0 right-0 z-50 bg-white 
                                border border-[#E5E5E5] rounded-xl shadow-md 
                                mt-1 max-h-48 overflow-y-auto">
                    <CommandEmpty className="py-3 text-center text-sm text-gray-400">
                      No teacher found.
                    </CommandEmpty>
                    <CommandGroup>
                      {teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          value={`${teacher.firstName} ${teacher.lastName}`}
                          onSelect={(val) => {
                            setSelectedTeacher(teacher.id);
                            setTeacherSearch(val);
                          }}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer 
                           hover:bg-chestnut/5 rounded-lg mx-1"
                        >
                          <div className="w-7 h-7 rounded-full bg-chestnut/10 flex items-center 
                                justify-center flex-shrink-0">
                            <span className="text-chestnut text-xs font-semibold">
                              {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                            </span>
                          </div>
                          <span className="text-sm text-[#131313] font-medium capitalize">
                            {`${teacher.firstName} ${teacher.lastName}`.toLowerCase()
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>
          </div> */}

        </div>

        {/* Subjects display */}
        <div>
          <h2 className="text-center capitalize text-2xl text-chestnut font-semibold font-poppins mb-4">
            {/* JSS 1 Subjects */}
            {className}
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
          <div className="w-full gap-4 mt-6">
            <Button
              onClick={createClassHandler}
              variant={"outline"}
              disabled={loading || isLoading || !className || !activeCourses || activeCourses.length === 0}
              className="px-6 cursor-pointer w-full py-2 rounded-md bg-chestnut text-white font-poppins"
            >
              {loading ? (
                <div className="flex gap-2 items-center"><Loader2 className="size-5 mx-auto animate-spin text-white" /> <p>Submit...</p></div>
              ) : (
                <span>Submit</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassRegistration;
