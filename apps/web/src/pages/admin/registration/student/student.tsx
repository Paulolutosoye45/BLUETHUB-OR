import { Link } from "react-router-dom"

const Student = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl border rounded-[5px] border-white/20 shadow-xl overflow-hidden drop-shadow-white">
                <div className="flex justify-center h-[70vh] flex-col p-8 space-y-4 text-center">
                    <Link
                        to="/admin/registration/student/new"
                        className="w-full py-7 bg-[#2B3E8F] hover:bg-[#2B3E8F]/90 text-white font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                        New User
                    </Link>
                    <Link
                        to="/admin/registration/student/edit"
                        className="w-full py-7 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#EC1B2C] font-semibold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Student