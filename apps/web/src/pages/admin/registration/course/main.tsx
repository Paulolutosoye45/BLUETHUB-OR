import { useEffect, useState } from "react";
// import EmptyClass from "./class/empty-subject";
import { schoolService } from "@/services/school";
import type { SchoolInfo } from "@/services";
import { localData } from "@/utils";
import { AxiosError } from "axios";
import { AlertCircle, RefreshCcw } from "lucide-react";
import ViewAllSubject from "./class/view-all-subject";
import EmptySubject from "./class/empty-subject";

export interface Subject {
  subject: string;
  schoolId: string;
  category: "Major" | "Minor";
}

const CoursesMain = () => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const schoolId = localData.retrieve("schoolInfo") as SchoolInfo;

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await schoolService.getAllSchoolSubject(schoolId.id);
      setSubjects(data.allSubjects);
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.responseMessage ??
          error.response?.data?.message ??
          error.message
          : (error as Error).message;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId?.id) fetchSubjects();
  }, []);

  if (loading) return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-gray-200 rounded-md" />
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Two column subject list skeleton */}
      <div className="flex gap-6">
        {/* Major column */}
        <div className="flex-1 space-y-3">
          <div className="h-8 w-28 bg-chestnut/20 rounded-lg" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-full bg-gray-100 rounded-md" />
          ))}
        </div>

        {/* Divider */}
        <div className="w-1 bg-gray-200 self-stretch rounded-full" />

        {/* Minor column */}
        <div className="flex-1 space-y-3">
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-full bg-gray-100 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );

  if (errorMsg) return (
    <div className="flex flex-col min-h-screen items-center justify-center py-16 px-6 text-center space-y-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="size-8 text-red-500" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-800">Something went wrong</h3>
        <p className="text-xs text-gray-500 max-w-xs">{errorMsg}</p>
      </div>

      {/* Retry */}
      <button
        onClick={() => {
          setErrorMsg("");
          setLoading(true);
          fetchSubjects();
        }}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-chestnut rounded-lg hover:opacity-90 transition-opacity"
      >
        <RefreshCcw className="size-3.5" />
        Try again
      </button>
    </div>
  );


  return (
    <>
      {subjects.length === 0 ? (
        <EmptySubject />
      ) : (
        <ViewAllSubject />
      )}
    </>
  );
};

export default CoursesMain;