import { Outlet } from "react-router-dom";
import MyCourseAppBar from "../courses/component/app-bar";
import { useState } from "react";


const DiscussionIndex = () => {
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

export default DiscussionIndex