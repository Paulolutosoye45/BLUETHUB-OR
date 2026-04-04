import { Button } from "@bluethub/ui-kit"
import { Clock, Download, Play, Signal } from "lucide-react"
import BoardImage from '@/assets/jpeg/board-image.jpg'
import PDF from "@/assets/png/Pdf.png";

const WatchClass = () => {
  return (
    <div className="h-screen overflow-y-auto">
    <div className="px-7 py-4">
      <div className="bg-white border border-[#3A3A3A33] rounded-2xl overflow-hidden">

        {/* Image */}
        <div className="relative h-72">
          <div className="bg-[#3A3A3A80] absolute inset-0 z-10" />

          <img
            src={BoardImage}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer">
            <svg width="45" height="48" viewBox="0 0 45 48" fill="none">
              <path d="M41.2332 17.5785C42.3708 18.1891 43.3223 19.1005 43.9859 20.2152C44.6494 21.3299 45 22.6058 45 23.9063C45 25.2067 44.6494 26.4826 43.9859 27.5973C43.3223 28.712 42.3708 29.6235 41.2332 30.2341L10.888 46.8891C6.00178 49.5736 0 46.0834 0 40.5637L0 7.25128C0 1.72911 6.00178 -1.75871 10.888 0.921098L41.2332 17.5785Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="space-y-1">
              <div>
                <h2 className="text-[#3A3A3ABF] font-medium text-[20.74px]">Linear Equation: Solving For X</h2>
                <p className="text-[#3A3A3ABF] font-medium text-[12.44px]">Learn the fundamentals of solving linear equations with step-by-step examples and practice problems.</p>
              </div>
              <p className="text-[#3A3A3ABF] font-medium text-[12.44px]">Date: Tuesday, 27 July 2025</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center text-blck-b2/75 text-sm font-medium font-Poppins gap-1">
                <Clock className="w-4 h-4" />
                <span>8:45</span>
              </div>
              <div className="flex items-center text-[#FFCD29] text-sm font-medium font-Poppins gap-1">
                <Signal className="w-4 h-4 text-[#FFD344]" />
                <span className="text-blck-b2/75">Beginner </span>
              </div>
              <Button className="bg-blck-b2 cursor-pointer hover:bg-blck-b2 text-white font-Poppins font-semibold text-sm px-4 py-2 rounded-md">
                <Play className="text-white" />
                <span >Watch</span>
              </Button>
            </div>
          </div>
          <div className="mt-7.5 space-y-3.5">
            <div className="flex items-center gap-4 border border-[#4F61E880]  rounded-lg px-4 py-3 w-fit ">
              <img src={PDF} className="w-5 h-5" />

              <p className="text-student-chestnut font-medium text-sm truncate">
                Linear Equation File PDF.....
              </p>

              <div className="w-px h-5 bg-blue-300" />

              <Download className="w-5 h-5 text-blue-600 cursor-pointer" />

            </div>
            <div className="flex items-center gap-4 border border-[#4F61E880]  rounded-lg px-4 py-3 w-fit ">
              <img src={PDF} className="w-5 h-5" />

              <p className="text-student-chestnut font-medium text-sm truncate">
                Linear Equation File PDF.....
              </p>

              <div className="w-px h-5 bg-blue-300" />

              <Download className="w-5 h-5 text-blue-600 cursor-pointer" />

            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  )
}

export default WatchClass