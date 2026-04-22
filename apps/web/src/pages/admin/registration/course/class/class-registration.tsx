import { AlertCircle, RefreshCcw } from "lucide-react";
import EmptyClass from "./empty-classes";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { schoolService } from "@/services/school";
import ClassviewAll from "./class-view-all";


export interface Classroom {
  id: string;
  name: string;
  noOfStudents: number;
  isActive: boolean;
  creationDate: string;
  modifiedDate: string;
}


const ClassRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [errorMsg, setErrorMsg] = useState("");


  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const { data } = await schoolService.getAllClassRooms();
      setClasses(data.data.classrooms); // ← data.data.classrooms not data.classrooms
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
    fetchClassrooms();
  }, []);

  if (loading) return (
    <div className="animate-shimmer p-6">
      {/* Top bar skeleton */}
      <div className="bg-chestnut px-5 py-3 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white/20 rounded" />
          <div className="h-4 w-32 bg-white/20 rounded-md" />
        </div>
        <div className="w-5 h-5 bg-white/20 rounded" />
      </div>

      <div className="p-6 space-y-6 bg-student-chestnut">
        {/* Title + button */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-44 bg-gray-200 rounded-md" />
            <div className="h-3 w-72 bg-gray-100 rounded-md" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <div className="h-5 w-8 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 px-5 py-3 bg-gray-50 gap-4">
            {["w-4", "w-32", "w-20", "w-16"].map((w, i) => (
              <div key={i} className={`h-3 ${w} bg-gray-200 rounded`} />
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-5 py-4 gap-4 items-center"
                style={{ opacity: 1 - i * 0.08 }} // fade out towards bottom
              >
                <div className="h-3 w-5 bg-gray-100 rounded" />
                <div className="h-3.5 w-36 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-green-50 rounded-full" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-14 bg-gray-100 rounded" />
                  <div className="h-7 w-12 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
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
          fetchClassrooms();
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
      {classes.length === 0 ? (
        <EmptyClass />
      ) : (
        <ClassviewAll />
      )}
    </>
  );
};

export default ClassRegistration;
