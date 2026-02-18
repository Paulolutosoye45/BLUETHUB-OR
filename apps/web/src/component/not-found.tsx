import { ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

const  NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0F172A] via-[#020617] to-black px-4">
      <div className="relative max-w-2xl w-full  text-center">
        
        {/* Glow Effect */}
        <div className="absolute inset-0 blur-3xl opacity-30 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />

        {/* Content */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-14 shadow-2xl">
          
          {/* 404 */}
          <h1 className="text-[6rem] sm:text-[8rem] font-extrabold tracking-tight bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            404
          </h1>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-2">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-400 mt-4 max-w-md mx-auto">
            Oops! The page you’re looking for doesn’t exist or has been moved.
            Let’s get you back on track.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-medium shadow-lg"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 mt-6">
          Error code: 404 • Lost in space 🚀
        </p>
      </div>
    </div>
  );
}
export default NotFound