import { Outlet } from "react-router-dom"
import MyCourseAppBar from "./component/app-bar"
import { useState } from "react";



const CourseIndex = () => {
    const [,setMobileNavOpen] = useState(false);
  return (
    <div>
      <MyCourseAppBar />
      <div>
        <Outlet context={{ openMobileNav: () => setMobileNavOpen(true) }} />
      </div>
    </div>
  )
}

export default CourseIndex