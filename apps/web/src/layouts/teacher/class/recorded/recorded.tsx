// import RecordedAppbar from "@/pages/teacher/recorded/recorded-bar"
import { Outlet } from "react-router-dom"

const RecordedLayout = () => {
    return (
        <div>
            <div>
                {/* <RecordedAppbar /> */}
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}

export default RecordedLayout