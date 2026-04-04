import RecordedAppbar from "@/pages/teacher/recorded/recorded-bar"
import { Outlet } from "react-router-dom"

const RecordedLayout = () => {
    return (
        <div className=" p-6">
            <div>
                <RecordedAppbar />
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}

export default RecordedLayout