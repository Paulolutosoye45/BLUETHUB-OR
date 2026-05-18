import { Outlet } from "react-router-dom"

const Teacherlayout = () => {
    return (
        <div>
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    )
}

export default Teacherlayout