import { PanelSidebar } from "./dashboard/layout/panel-side-bar"
import RegisterSchoolPage from "./register-schoolpage"


const Onboarding = () => {
  return (
    <div className="flex h-screen bg-[#EEEDF9] font-Poppins">
      <PanelSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <RegisterSchoolPage/>
      </div>
    </div>
  )
}

export default Onboarding 