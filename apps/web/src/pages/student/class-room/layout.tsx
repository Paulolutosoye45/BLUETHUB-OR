import { Outlet } from "react-router-dom";
import StudentAppBar from "../component/app-bar";
const ClassRoomlayout = () => {
  return (
    <section className="h-screen bg-gray-50 overflow-y-scroll
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar]:h-2.5
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-[#4F61E814]
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-400
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
      <StudentAppBar />

      <div className=" w-full px-3">
        <Outlet />
      </div>
    </section>
  )
}

export default ClassRoomlayout