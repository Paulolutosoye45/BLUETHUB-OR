import TitleBar from "@/shared/title-bar"
import { Link } from "react-router-dom"

const RecordedMain = () => {
    return (
        <div className="">
            <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">
                <TitleBar
                    title="Start a Class"
                />

                <div className="flex-1 p-8 bg-white/70 backdrop-blur-sm">
                    <div className="w-full mx-auto max-w-2xl border rounded-[5px] border-white/20 shadow-xl overflow-hidden drop-shadow-white">
                        <div className="flex justify-center h-[70vh] flex-col p-8 space-y-4 text-center">
                            <Link
                                to="/teacher/recorded-class/select-class"
                                className="w-full py-7 bg-[#2B3E8F] hover:bg-[#2B3E8F]/90 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                Start Class
                            </Link>
                            <Link
                                to="/teacher/resume-class"
                                className="w-full py-7 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#EC1B2C] font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Resume Class
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecordedMain