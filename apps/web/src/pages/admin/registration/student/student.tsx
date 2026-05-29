import { authService } from "@/services/auth";
import { AxiosError } from "axios";
// import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyStudent from "./empty-student";

const Student = () => {
    const [loading, setLoading] = useState(true);
  // const [subjects, setSubjects] = useState<any[]>([]);
  const [, setErrorMsg] = useState("");


  const fetchStudent = async () => {
    try {
      setLoading(true);
      const { data } = await authService.getStudents({ pageNumber: 2, pageSize: 100 });
      console.log(data)
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
 fetchStudent();
  }, []);

  if (loading) return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="h-7 w-44 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      <div className="h-9 w-36 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
    </div>

    {/* Two column layout */}
    <div className="flex gap-6">

      {/* Major subjects column */}
      <div className="flex-1 space-y-3">
        {/* Column label */}
        <div className="h-8 w-24 rounded-lg bg-gradient-to-r from-chestnut/20 via-chestnut/10 to-chestnut/20 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

        {/* Subject rows with staggered widths — feels like real text */}
        {[88, 72, 95, 65, 80].map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50 border border-gray-100"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icon placeholder */}
            <div className="h-5 w-5 rounded-full shrink-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            {/* Text placeholder — varying widths look natural */}
            <div
              className="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 self-stretch rounded-full" />

      {/* Minor subjects column */}
      <div className="flex-1 space-y-3">
        <div className="h-8 w-24 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

        {[75, 90, 60, 85, 70].map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50 border border-gray-100"
            style={{ animationDelay: `${i * 80 + 40}ms` }}
          >
            <div className="h-5 w-5 rounded-full shrink-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            <div
              className="h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

  // if (errorMsg) return (
  //   <div className="flex flex-col min-h-screen items-center justify-center py-16 px-6 text-center space-y-4">
  //     {/* Icon */}
  //     <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
  //       <AlertCircle className="size-8 text-red-500" />
  //     </div>

  //     {/* Text */}
  //     <div className="space-y-1">
  //       <h3 className="text-sm font-semibold text-gray-800">Something went wrong</h3>
  //       <p className="text-xs text-gray-500 max-w-xs">{errorMsg}</p>
  //     </div>

  //     {/* Retry */}
  //     <button
  //       onClick={() => {
  //         setErrorMsg("");
  //         setLoading(true);
  //         fetchStudent();
  //       }}
  //       className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-chestnut rounded-lg hover:opacity-90 transition-opacity"
  //     >
  //       <RefreshCcw className="size-3.5" />
  //       Try again
  //     </button>
  //   </div>
  // );


    return (
        <div><EmptyStudent/></div>
    )
}

export default Student